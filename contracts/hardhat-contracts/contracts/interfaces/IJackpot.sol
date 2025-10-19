// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IJackpot {
    function assignTicket(address player) external payable;
    function claimJackpotFromGame(address player) external;
    function getJackpotFee() external view returns (uint256 entropyFee);
    function winners(address player) external view returns (uint256 prize);
}
