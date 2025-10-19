// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {console, Test} from "forge-std/Test.sol";
import {KickTheMarket} from "./KickTheMarketV2.sol";
import {IJackpot} from "./interfaces/IJackpot.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

// Mock contract
contract MockJackpot is IJackpot {
    mapping(address => uint256) public winners;
    uint256 public entropyFee = 0.001 ether;

    function assignTicket(address player) external payable override {
        // Do nothing, just accept ETH
    }

    function claimJackpotFromGame(address player) external override {
        uint256 amount = winners[player];
        winners[player] = 0;
        (bool success, ) = payable(player).call{value: amount}("");
        require(success, "transfer failed");
    }

    function getJackpotFee() external view override returns (uint256) {
        return entropyFee;
    }

    // Test helper
    function setWinner(address player, uint256 amount) public {
        winners[player] = amount;
    }

    function setFee(uint256 fee) public {
        entropyFee = fee;
    }
}

// Test contract
contract KickTheMarketTest is Test {
    using ECDSA for bytes32;

    KickTheMarket ktm;
    KickTheMarket ktmWithPrize;
    MockJackpot mockJackpot;

    address internal constant PLAYER = address(0x1234);
    address internal constant OTHER_PLAYER = address(0x5678);

    string constant TOKEN_URI = "https://example.com/token/1";
    uint256 constant SCORE = 1000;
    uint256 constant ANOMALY_LEVEL = 5;
    uint256 constant BLACK_SWAN_LEVEL = 3;
    uint256 constant TOTAL_KICKS = 25;

    // Private key for backend signer (to sign messages)
    uint256 internal constant PRIV_KEY = 0x1234123412341234123412341234123412341234123412341234123412341234;
    address internal constant BACKEND_SIGNER = 0xfF06ad5d076fa274B49C297f3fE9e29B5bA9AaDC;
    address internal constant EXPECTED_SIGNER = 0xfF06ad5d076fa274B49C297f3fE9e29B5bA9AaDC;

    function setUp() public {
     assertEq(vm.addr(PRIV_KEY), BACKEND_SIGNER, "Private key does not match backend signer");
        // Ensure BACKEND_SIGNER == EXPECTED_SIGNER
        assertEq(BACKEND_SIGNER, EXPECTED_SIGNER);

        mockJackpot = new MockJackpot();
        vm.startPrank(BACKEND_SIGNER);
        ktm = new KickTheMarket(0, address(mockJackpot));
        console.log(ktm.backendSigner());        

        ktmWithPrize = new KickTheMarket(0.42 ether, address(mockJackpot));
        console.log(ktmWithPrize.backendSigner());
        vm.stopPrank();
        
        vm.deal(PLAYER, 3 ether);
    }

    // Helper: Create ECDSA signature
    function _createProof(string memory uri, address sender) internal view returns (bytes memory) {
        bytes32 messageHash = keccak256(
            abi.encodePacked(
                block.chainid,
                uri,
                sender
            )
        );
        bytes32 digest = MessageHashUtils.toEthSignedMessageHash(messageHash);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(PRIV_KEY, digest);
        return abi.encodePacked(r, s, v);
    }

    function test_InitialValues() public view {
        require(ktm.mintPrice() == 0, "Mint price should be 0");
    }

    function test_MintValidScore() public {
        bytes memory proof = _createProof(TOKEN_URI, PLAYER);
        vm.deal(PLAYER, 1 ether);

        uint256 fee = mockJackpot.getJackpotFee();
        vm.prank(PLAYER);
        uint256 tokenId = ktm.mint{value: fee+1}(TOKEN_URI, SCORE, ANOMALY_LEVEL, BLACK_SWAN_LEVEL, TOTAL_KICKS, proof);

        assertEq(ktm.ownerOf(tokenId), PLAYER, "Owner should be player");

        (uint256 s, uint256 a, uint256 b, uint256 t, address p) = ktm.scores(tokenId);
        assertEq(s, SCORE, "Score should match");
        assertEq(a, ANOMALY_LEVEL, "Anomaly level should match");
        assertEq(b, BLACK_SWAN_LEVEL, "Black swan level should match");
        assertEq(t, TOTAL_KICKS, "Total kicks should match");
        assertEq(p, PLAYER, "Player should match");

        assertEq(ktm.tokenURI(tokenId), TOKEN_URI, "Token URI should match");
    }

    function test_RevertOnZeroScore() public {
        bytes memory proof = _createProof(TOKEN_URI, PLAYER);
        vm.deal(PLAYER, 1 ether);

        uint256 fee = mockJackpot.getJackpotFee();
        vm.expectRevert(bytes("Zero Score"));
        vm.prank(PLAYER);
        ktm.mint{value: fee+1}(TOKEN_URI, 0, ANOMALY_LEVEL, BLACK_SWAN_LEVEL, TOTAL_KICKS, proof);
    }

    function test_RevertOnEmptyTokenUri() public {
        bytes memory proof = _createProof("", PLAYER);
        vm.deal(PLAYER, 1 ether);

        uint256 fee = mockJackpot.getJackpotFee();
        vm.expectRevert(bytes("Missing TokenUri"));
        vm.prank(PLAYER);
        ktm.mint{value: fee+1}("", SCORE, ANOMALY_LEVEL, BLACK_SWAN_LEVEL, TOTAL_KICKS, proof);
    }

    function test_RevertOnInsufficientETH() public {
        bytes memory proof = _createProof(TOKEN_URI, PLAYER);
        vm.deal(PLAYER, 1 ether);

        uint256 fee = mockJackpot.getJackpotFee();
        vm.expectRevert(bytes("Not enough ETH"));
        vm.prank(PLAYER);
        ktm.mint{value: fee - 1}(TOKEN_URI, SCORE, ANOMALY_LEVEL, BLACK_SWAN_LEVEL, TOTAL_KICKS, proof);
    }

    function test_RevertOnDuplicateProof() public {
        bytes memory proof = _createProof(TOKEN_URI, PLAYER);
        vm.deal(PLAYER, 1 ether);

        uint256 fee = mockJackpot.getJackpotFee();
        vm.prank(PLAYER);
        ktm.mint{value: fee+1}(TOKEN_URI, SCORE, ANOMALY_LEVEL, BLACK_SWAN_LEVEL, TOTAL_KICKS, proof);

        vm.expectRevert(bytes("Already used"));
        vm.prank(PLAYER);
        ktm.mint{value: fee+1}(TOKEN_URI, SCORE + 100, ANOMALY_LEVEL, BLACK_SWAN_LEVEL, TOTAL_KICKS, proof);
    }

    function test_CheckTopScore_NewTopScore() public {
        bytes memory proof = _createProof(TOKEN_URI, PLAYER);
        vm.deal(PLAYER, 1 ether);

        uint256 fee = mockJackpot.getJackpotFee();
        vm.expectEmit(true, true, true, true, address(ktm));
        emit KickTheMarket.NewTopScore(0, 0, SCORE);
        vm.prank(PLAYER);
        ktm.mint{value: fee+1}(TOKEN_URI, SCORE, ANOMALY_LEVEL, BLACK_SWAN_LEVEL, TOTAL_KICKS, proof);
    }

    function test_ClaimWeekWinner_Valid() public {
        // Warp to avoid underflow on week - 1
        vm.warp(8 days);
        uint256 currentWeek = (block.timestamp - ktmWithPrize.TIMESTAMP_ZERO()) / 7 days;
        uint256 pastWeek = currentWeek - 1;

        bytes memory proof = _createProof(TOKEN_URI, PLAYER);
        vm.deal(PLAYER, 1 ether);

        uint256 fee = mockJackpot.getJackpotFee();
        vm.prank(PLAYER);
        ktmWithPrize.mint{value: ktmWithPrize.mintPrice() + fee + 1}(TOKEN_URI, SCORE, ANOMALY_LEVEL, BLACK_SWAN_LEVEL, TOTAL_KICKS, proof);

        // Warp to next week
        vm.warp(block.timestamp + 8 days);

        (,,uint256 prize,,bool claimed) = ktmWithPrize.maxScores(pastWeek);
        assertTrue(prize > 0, "Prize should be > 0");

        vm.expectEmit(true, true, true, true, address(ktmWithPrize));
        emit KickTheMarket.PrizeClaimed(pastWeek, PLAYER, prize);
        vm.prank(PLAYER);
        ktmWithPrize.claimWeekWinner(pastWeek);

        assertTrue(claimed, "Should be marked as claimed");
    }
    
    function test_RevertClaimWeekWinner_ZeroPrice() public {
        // Warp to avoid underflow on week - 1
        vm.warp(8 days);
        uint256 currentWeek = (block.timestamp - ktm.TIMESTAMP_ZERO()) / 7 days;
        uint256 pastWeek = currentWeek - 1;

        bytes memory proof = _createProof(TOKEN_URI, PLAYER);
        vm.deal(PLAYER, 1 ether);

        uint256 fee = mockJackpot.getJackpotFee();
        vm.prank(PLAYER);
        ktm.mint{value: fee+1}(TOKEN_URI, SCORE, ANOMALY_LEVEL, BLACK_SWAN_LEVEL, TOTAL_KICKS, proof);

        // Warp to next week
        vm.warp(block.timestamp + 8 days);

        vm.expectRevert(bytes("Zero Prize"));
        vm.prank(PLAYER);
        ktm.claimWeekWinner(pastWeek);
    }

    function test_RevertClaimWeekWinner_OngoingWeek() public {
        uint256 currentWeek = (block.timestamp - ktm.TIMESTAMP_ZERO()) / 7 days;
        vm.expectRevert(bytes("On going week"));
        ktm.claimWeekWinner(currentWeek);
    }

    function test_RevertClaimWeekWinner_AlreadyClaimed() public {
        vm.warp(8 days);
        uint256 currentWeek = (block.timestamp - ktmWithPrize.TIMESTAMP_ZERO()) / 7 days;
        uint256 pastWeek = currentWeek - 1;

        bytes memory proof = _createProof(TOKEN_URI, PLAYER);
        vm.deal(PLAYER, 1 ether);

        uint256 fee = mockJackpot.getJackpotFee();
        vm.prank(PLAYER);
        ktmWithPrize.mint{value: ktmWithPrize.mintPrice() + fee + 1}(TOKEN_URI, SCORE, ANOMALY_LEVEL, BLACK_SWAN_LEVEL, TOTAL_KICKS, proof);

        vm.warp(block.timestamp + 8 days);
        vm.prank(PLAYER);
        ktmWithPrize.claimWeekWinner(pastWeek);

        vm.expectRevert(bytes("Already Claimed"));
        vm.prank(PLAYER);
        ktmWithPrize.claimWeekWinner(pastWeek);
    }

    function test_ClaimJackpot_ForwardCall() public {
        mockJackpot.setWinner(PLAYER, 5 ether);
        vm.deal(address(mockJackpot), 5 ether);

        uint256 balanceBefore = PLAYER.balance;
        vm.prank(PLAYER);
        ktm.claimJackpot();
        uint256 balanceAfter = PLAYER.balance;

        assertEq(balanceAfter - balanceBefore, 5 ether, "Player should receive prize");
        assertEq(mockJackpot.winners(PLAYER), 0, "Jackpot prize should be cleared");
    }
    
    function test_Fallback_Reverts() public {
        vm.expectRevert(bytes("Fallback not allowed"));
        (bool success, ) = address(ktm).call{value: 1 ether}("invalid");
        require(!success, "Fallback should revert");
    }
}
