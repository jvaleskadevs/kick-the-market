// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721Burnable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import {ERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "./interfaces/IJackpot.sol";

/**
 * @title Kick The Market · Game Score NFT
 * @dev A simple ERC721 contract to mint NFTs representing game scores.
 * Every minted score get a jackpot ticket from the JackpotSDK.
 * Each NFT requires:
 * - tokenUri: the metadata uri for the token being minted
 * - score: the player's score
 * - anomalyLevel: the anomaly level reached by the player
 * - blackSwanLevel: the blackswan level reached by the player
 * - totalKicks: the total number of kicks
 * - proof: a signature to verify the game data
 *
 * Minting price can be set or remain free but jackpot SDK requires a small fee anyway.
 */
contract KickTheMarket is ERC721, ERC721Enumerable, ERC721URIStorage, ERC721Burnable, ReentrancyGuard {
    using ECDSA for bytes32;

    uint256 private _nextTokenId;
    address public immutable backendSigner;
    
    uint256 public mintPrice = 0;
    uint256 public immutable TIMESTAMP_ZERO = block.timestamp;

    IJackpot private jackpot;   

    // Structure to store score data
    struct ScoreData {
        uint256 score;
        uint256 anomalyLevel;
        uint256 blackSwanLevel;
        uint256 totalKicks;
        address player;
    }
    
    // Structure to store score data
    struct MaxScoreData {
        uint256 score;
        uint256 tokenId;
        uint256 prize;
        address player;
        bool claimed;
    }

    // Mapping from token ID to score data
    mapping(uint256 tokenId => ScoreData scoreData) public scores;
    // Mapping from week to max score data
    mapping(uint256 week => MaxScoreData maxScoreData) public maxScores;
    // keep track of already used score proofs
    mapping(bytes32 => bool) private usedProofs; 

    // Emitted when a new score is minted
    event Mint(
        uint256 indexed tokenId,
        address indexed to,
        uint256 score,
        uint256 anomalyLevel,
        uint256 blackSwanLevel,
        uint256 totalKicks,    
        bytes proof
    );
    
    event NewTopScore(uint256 indexed tokenId, uint256 indexed week, uint256 score);
    event WeeklyWinner(uint256 indexed week, uint256 score, uint256 indexed tokenId, uint256 prize, address indexed player);
    event PrizeClaimed(uint256 indexed week, address indexed winner, uint256 amount);

    /**
     * @dev Sets minting price and initializes ERC721 token and Jackpot SDK.
     */
    constructor(uint256 _mintPrice, address _jackpotAddress) ERC721("Kick The Market", "KTM") {
        backendSigner = msg.sender;
        mintPrice = _mintPrice;
        jackpot = IJackpot(_jackpotAddress);
    }

    /**
     * @notice Mints a new NFT with the given score data.
     * @dev Anyone can call this function with valid game data.
     *
     * @param score The game score.
     * @param anomalyLevel The anomaly level.
     * @param blackSwanLevel The black swan level.
     * @param proof A hash to verify associated game data.
     *
     * @return the tokenId of the nft being minted
     */
    function mint(
        string memory tokenUri,
        uint256 score,
        uint256 anomalyLevel, 
        uint256 blackSwanLevel,
        uint256 totalKicks,
        bytes memory proof
    ) public payable nonReentrant returns (uint256) {
        require(score > 0, "Zero Score");
        require(bytes(tokenUri).length > 0, "Missing TokenUri");
        require(msg.value > mintPrice + jackpot.getJackpotFee(), "Not enough ETH");

        uint256 tokenId = _nextTokenId++;
        address to = msg.sender;
        
        _verifyProof(proof, tokenUri, to);
        _assignJackpotTicket(to);

        _setTokenURI(tokenId, tokenUri);
        _safeMint(to, tokenId);
        
        _checkTopScore(score, tokenId);

        scores[tokenId] = ScoreData({
            score: score,
            anomalyLevel: anomalyLevel,
            blackSwanLevel: blackSwanLevel,
            totalKicks: totalKicks,
            player: to
        });

        emit Mint(tokenId, to, score, anomalyLevel, blackSwanLevel, totalKicks, proof);
        
        return tokenId;
    }

     /**
     * @notice Check if the score being minted is the top score of the week.
     * @dev It also settle the previous week winner when need.
     */     
    function _checkTopScore(uint256 score, uint256 tokenId) internal {
        /// Get current week and max score of the week
        uint256 currentWeek = (block.timestamp - TIMESTAMP_ZERO) / 7 days;
        MaxScoreData storage currentWeekMaxScore = maxScores[currentWeek];
        /// Check if this is the top score of the week
        if (currentWeekMaxScore.score < score) {
            if (currentWeekMaxScore.score == 0 && currentWeek > 1) {
                // this is the first score of this week
                // emit the winner of the previous week
                uint256 lastWeek = currentWeek - 1;
                MaxScoreData memory lastWeekMaxScore = maxScores[lastWeek];
                
                emit WeeklyWinner(
                    lastWeek,
                    lastWeekMaxScore.score, 
                    lastWeekMaxScore.tokenId,
                    lastWeekMaxScore.prize, 
                    lastWeekMaxScore.player
                );
            }
            // This is the top score of the week now
            currentWeekMaxScore.score = score;
            currentWeekMaxScore.tokenId = tokenId;
            currentWeekMaxScore.player = msg.sender;
            
            emit NewTopScore(tokenId, currentWeek, score);
        }    
        currentWeekMaxScore.prize += mintPrice;
    }

     /**
     * @notice Call the Jackpot SDK to assign a ticket to the player.
     * @dev Only previously registered games can increase the jackpot by
     * calling this function. Donations are allowed through receive fallback.
     * 
     * @param player the address of the player to assign the ticket to.
     */     
    function _assignJackpotTicket(address player) internal {
        uint256 amount = msg.value - mintPrice;
        jackpot.assignTicket{value: amount}(player);
    }

    /**
     * @notice Verify that uri has been created and signed on our backend
     */
    function _verifyProof(bytes memory proof, string memory uri, address sender) internal {
        bytes32 messageHash = keccak256(
            abi.encodePacked(
                block.chainid,
                uri,
                sender
            )
        );        
        
        address signer = MessageHashUtils.toEthSignedMessageHash(messageHash).recover(proof);
        require(signer == backendSigner, "Invalid signature");
        
        require(!usedProofs[messageHash], "Already used");
        usedProofs[messageHash] = true;
    }

    /**
     * @notice Send any pending jackpot prize to the caller if any.
     * @dev The function checks for pending jackpot prizes.
     */    
    function claimJackpot() public nonReentrant {
        address player = msg.sender;
        if (jackpot.winners(player) > 0) {
            jackpot.claimJackpotFromGame(player);
        }
    }

    /**
     * @notice Send any pending prize to any previous week winner.
     */    
    function claimWeekWinner(uint256 week) public nonReentrant {        
        uint256 currentWeek = (block.timestamp - TIMESTAMP_ZERO) / 7 days;
        require(week < currentWeek, "On going week");
        MaxScoreData storage weekMaxScore = maxScores[week];
        require(weekMaxScore.claimed != true, "Already Claimed");     
        uint256 prize = weekMaxScore.prize;
        require(prize > 0, "Zero Prize");
        
        address weekWinner = weekMaxScore.player;
        require(weekWinner != address(0), "Zero Address");
        weekMaxScore.claimed = true;
        
        (bool success, ) = weekWinner.call{value: prize}("");
        require(success, "Prize Transfer Failed");
        
        emit PrizeClaimed(week, weekWinner, prize);
    }

    /**
     * @dev Blocks any accidental ETH transfers to the contract.
     */
    receive() external payable {
        revert("Receive ETH not allowed");
    }

    fallback() external payable {
        revert("Fallback not allowed");
    }

    // The following functions are overrides required by Solidity.

    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}

