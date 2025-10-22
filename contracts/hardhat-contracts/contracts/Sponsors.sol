// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title Sponsors.sol - Sponsor Management for the Jackpot
/// @notice Manages sponsor donations to jackpot and ad allocation by tier and week. First come, first served.
contract Sponsors is AccessControl, ReentrancyGuard {   
    bytes32 public constant JACKPOT_GAME_ROLE = keccak256("JACKPOT_GAME_ROLE");

    enum Tier {
        //Diamond,
        Gold,
        Silver,
        Bronze
    }
    
    address public JACKPOT_ADDRESS;
    uint256 public immutable TIMESTAMP_ZERO = block.timestamp;
    
    // Minimum ETH required per tier
    uint256 public GOLD_PRICE = 0.000001 ether;
    uint256 public SILVER_PRICE = 0.00000069 ether;
    uint256 public BRONZE_PRICE = 0.00000042 ether;

    // Weekly ad slots
    uint256 public constant BRONZE_SLOTS = 3;
    uint256 public constant SILVER_SLOTS = 2;
    uint256 public constant GOLD_SLOTS = 1;

    struct Ad {
        // address sending donation
        address sponsor;
        // Gold, Silver or Bronze
        Tier tier;
        // Sponsor name
        string name;  
        // Call to action, example: "Join Now"         
        string cta;       
        // Short description     
        string description;  
        // Sponsor website  
        string website;       
        // Sponsor logo url 
        string logoUrl;        
        // ETH donated for this ad
        uint256 amountDonated; 
        // Assigned week to display ad
        uint256 week;
    }  
    
    // Keep track of ads per week and tier
    // 6 slots: [0]=Gold, [1-2]=Silver, [3-5]=Bronze
    mapping(uint256 => Ad[6]) public weeklyAds; 
  
    // Events
    event NewSponsor(
        uint256 indexed week,
        address indexed sponsor,
        uint256 indexed amount,
        Tier tier,
        string name,
        string cta,
        string description,
        string logoUrl,
        string website
    );
    
    constructor(address _jackpotAddress) {     
        JACKPOT_ADDRESS = _jackpotAddress;   
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }    

    /// @notice Sponsor function: sends ETH to jackpot and claims ad slot
    /// @param _tier Desired tier (Gold, Silver, Bronze)
    /// @param _name Sponsor name
    /// @param _cta Call to action text
    /// @param _description A short description
    /// @param _website Sponsor website URL
    /// @param _logoUrl Sponsor logo URL
    function sponsorize(
        uint256 _week,
        Tier _tier,
        string calldata _name,
        string calldata _cta,
        string calldata _description,
        string calldata _website,
        string calldata _logoUrl
    ) external payable nonReentrant {
        require(msg.value >= tierPrice(_tier), "Not enough ETH for tier");

        // Assign slot based on tier and availability
        uint256 slotIndex;
        bool assigned;

        if (_tier == Tier.Gold) {
            if (weeklyAds[_week][slotIndex].sponsor == address(0)) {
                assigned = true;
            }
        } else if (_tier == Tier.Silver) {
            for (uint256 i = 1; i <= SILVER_SLOTS; i++) {
                if (weeklyAds[_week][i].sponsor == address(0)) {
                    slotIndex = i;
                    assigned = true;
                    break;
                }
            }
        } else if (_tier == Tier.Bronze) {
            for (uint256 i = 3; i < 6; i++) {
                if (weeklyAds[_week][i].sponsor == address(0)) {
                    slotIndex = i;
                    assigned = true;
                    break;
                }
            }
        }
        require(assigned, "No available slots for this tier this week");

        // Store the ad
        weeklyAds[_week][slotIndex] = Ad({
            sponsor: msg.sender,
            tier: _tier,
            name: _name,
            cta: _cta,
            description: _description,
            website: _website,
            logoUrl: _logoUrl,
            amountDonated: msg.value,
            week: _week
        });
        
        // Donate ETH to jackpot
        (bool success, ) = JACKPOT_ADDRESS.call{value: msg.value}("");
        require(success, "Transfer failed");

        emit NewSponsor(
            _week, 
            msg.sender, 
            msg.value, 
            _tier, 
            _name, 
            _cta,
            _description,
            _logoUrl,
            _website
        );
    }
    
    /// @notice Returns the current on going week
    /// @return The number of the current week
    function currentWeek() public view returns (uint256) {    
        return (block.timestamp - TIMESTAMP_ZERO) / 7 days;
    }

    /// @notice Returns the price for a given tier
    function tierPrice(Tier _tier) public view returns (uint256) {
        if (_tier == Tier.Gold) return GOLD_PRICE;
        if (_tier == Tier.Silver) return SILVER_PRICE;
        if (_tier == Tier.Bronze) return BRONZE_PRICE;
        revert("Invalid Tier");
    }

    /// @notice Returns all active ads for the current week
    /// @return Array of 6 Ads (some may be empty)
    function currentAds() public view returns (Ad[6] memory) {
        return weeklyAds[currentWeek()];
    }
    
    /// @notice Returns all active ads for the given week
    /// @return Array of 6 Ads (some may be empty)
    function adsOfWeek(uint256 week) public view returns (Ad[6] memory) {
        return weeklyAds[week];
    }
    
    // admin only functions
    function setPrices(uint256 gold, uint256 silver, uint256 bronze) public onlyRole(DEFAULT_ADMIN_ROLE) {
        GOLD_PRICE = gold;
        SILVER_PRICE = silver;
        BRONZE_PRICE = bronze;
    }
   
    function setJackpot(address jackpotAddress) public onlyRole(DEFAULT_ADMIN_ROLE) {
        JACKPOT_ADDRESS = jackpotAddress;
    }

    // Block any lost of funds
    receive() external payable {
        revert("Please, call Sponsorize function");
    }
    
    // Block fallback
    fallback() external payable {
        revert("Fallback not allowed");
    }
}
