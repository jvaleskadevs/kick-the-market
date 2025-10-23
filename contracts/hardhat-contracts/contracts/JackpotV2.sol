// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@pythnetwork/entropy-sdk-solidity/IEntropyV2.sol";
import "@pythnetwork/entropy-sdk-solidity/IEntropyConsumer.sol";

contract Jackpot is AccessControl, IEntropyConsumer, ReentrancyGuard {
    // Create a hash for the access control jackpot game role
    bytes32 public constant JACKPOT_GAME_ROLE = keccak256("JACKPOT_GAME_ROLE");

    uint256 public JACKPOT_PRIZE_PERMIL = 69; // 6.9% of current jackpot balance 
    uint256 public JACKPOT_WIN_ODDS = 69; // 1 / 69 chances of winning the jackpot
    uint256 public JACKPOT_FEE = 0.000042 ether; //  $0.1-0.2 to mitigate abuse, DDoS and DoS
    // Remove modulo bias when JACKPOT_WIN_ODDS is not a divisor of 2**256
    uint256 public JACKPOT_THRESHOLD = type(uint256).max - (type(uint256).max % JACKPOT_WIN_ODDS);

    // Required by Pyth Entropy SDK
    address entropyAddressBase = 0x6E7D74FA7d5c90FEF9F0512987605a6d546181Bb;
    IEntropyV2 entropy;

    // keep track of tickets and their owners
    mapping(uint64 ticketId => address player) public tickets;
    // keep track of winners and their prizes
    mapping(address player => uint256 prize) public winners;

    // jackpot events
    event TicketAssigned(uint64 indexed ticketId, address indexed player, uint256 amount, address indexed gameAddress);
    event JackpotWinner(uint64 indexed ticketId, address indexed winner, uint256 prize);
    event JackpotClaimed(address indexed winner, uint256 prize, address indexed caller);
    event NewDonation(address indexed sponsor, uint256 amount);

    // entropy events
    event RandomNumberRequested(uint64 indexed sequenceNumber, address indexed gameAddress);
    event RandomNumberResult(uint64 indexed sequenceNumber, bool isWinner, uint256 randomNumber);

    constructor(uint256 _jackpotPrizePermil, uint256 _jackpotWinOdds) {
        JACKPOT_PRIZE_PERMIL = _jackpotPrizePermil;
        JACKPOT_WIN_ODDS = _jackpotWinOdds;
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);

        entropy = IEntropyV2(entropyAddressBase);
    }
 
     /**
     * @notice Deposit ETH to increase the jackpot.Then, assign ticket to player.
     * @dev Only previously registered games can increase the jackpot by
     * calling this function. Donations are allowed through receive fallback.
     * 
     * @param player the address of the player to assign the ticket to.
     */    
    function assignTicket(address player) public payable onlyRole(JACKPOT_GAME_ROLE) returns (uint64) {
        uint64 ticketId = _requestRandomNumber();
        tickets[ticketId] = player;
        
        emit TicketAssigned(ticketId, player, msg.value, msg.sender);
        
        return ticketId;
    }

    /**
     * @notice Request a random number from the Entropy SDK.
     * @return sequenceNumber An identifier of the entropy request.
     */     
    function _requestRandomNumber() internal returns (uint64 sequenceNumber) {
      uint128 requestFee = entropy.getFeeV2();
      if (msg.value < requestFee + JACKPOT_FEE) revert("Not enough ETH for fees");

      sequenceNumber = entropy.requestV2{ value: requestFee }();

      emit RandomNumberRequested(sequenceNumber, msg.sender);
    }     

    /**
     * @notice Callback called by Entropy SDK to return random numbers
     * 
     * @param sequenceNumber the requestId for the random number
     * @param randomNumber the verifiable random number sent by Entropy SDK
     */     
    function entropyCallback(
      uint64 sequenceNumber,
      address /*_providerAddress*/,
      bytes32 randomNumber
    ) internal override {
        uint256 rand = uint256(randomNumber);
        bool isWinner = rand < JACKPOT_THRESHOLD && rand % JACKPOT_WIN_ODDS == 0;
        
        if (isWinner) {          
            Jackpot._assignPrizeTo(sequenceNumber);
        }

        emit RandomNumberResult(sequenceNumber, isWinner, uint256(randomNumber));
    }

    /**
     * @notice Calculate and assign the jackpot prize to the winner.
     * 
     * @param ticketId the ticketId of the winner to assing the jackpot prize to.
     */    
    function _assignPrizeTo(uint64 ticketId) internal {
        address winner = tickets[ticketId];     
        uint256 prize = address(this).balance * JACKPOT_PRIZE_PERMIL / 1000;
        
        winners[winner] = prize;        
        
        emit JackpotWinner(ticketId, winner, prize);
    }

    /**
     * @notice Send any pending jackpot prize to the caller.
     */    
    function claimJackpot() public nonReentrant {
        address winner = msg.sender;
        uint256 prize = winners[winner]; 
        
        winners[winner] = 0;     
        
        (bool success, ) = winner.call{value: prize}("");
        require(success, "Prize transfer failed");
        
        emit JackpotClaimed(winner, prize, winner);
    }

    /**
     * @notice Send any pending jackpot prize to any winner.
     *
     * @param winner the address to send the prize to.
     */    
    function claimJackpotTo(address winner) public nonReentrant {
        uint256 prize = winners[winner]; 
        
        winners[winner] = 0;     
        
        (bool success, ) = winner.call{value: prize}("");
        require(success, "Prize transfer failed");
        
        emit JackpotClaimed(winner, prize, msg.sender);
    }
    
    /**
     * @notice Send any pending jackpot prize to any winner from any game.
     * @dev Only previously registered games can call this function.    
     * @param winner the address to send the prize to.
     */    
    function claimJackpotFromGame(address winner) public onlyRole(JACKPOT_GAME_ROLE) nonReentrant {
        uint256 prize = winners[winner]; 
        
        winners[winner] = 0;     
        
        (bool success, ) = winner.call{value: prize}("");
        require(success, "Prize transfer failed");
        
        emit JackpotClaimed(winner, prize, msg.sender);
    }
    
    function getJackpotFee() public view returns (uint256 jackpotFee) {
        jackpotFee = entropy.getFeeV2() + JACKPOT_FEE;
    }
    
    // This method is required by the IEntropyConsumer interface
    function getEntropy() internal view override returns (address) {
      return address(entropy);
    }
    
    // admin only functions
    
    function setJackpotPrizePermil(uint256 newPermil) external onlyRole(DEFAULT_ADMIN_ROLE) {
        JACKPOT_PRIZE_PERMIL = newPermil;
    }

    function setJackpotWinOdds(uint256 newOdds) external onlyRole(DEFAULT_ADMIN_ROLE) {
        JACKPOT_WIN_ODDS = newOdds;
        JACKPOT_THRESHOLD = type(uint256).max - (type(uint256).max % JACKPOT_WIN_ODDS);
    }
    
    function setJackpotFee(uint256 newFee) external onlyRole(DEFAULT_ADMIN_ROLE) {
        JACKPOT_FEE = newFee;
    }

    /**
     * @dev Ensure the contract can receive ETH transfers to, as jackpot donations.
     */
    receive() external payable {
        emit NewDonation(msg.sender, msg.value);
    }
    
    fallback() external payable {
        revert("Fallback not allowed");
    }
}
