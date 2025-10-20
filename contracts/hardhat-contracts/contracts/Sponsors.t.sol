// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "./Sponsors.sol";

contract MockJackpot {
    receive() external payable {}
}

contract SponsorsTest is Test {
    Sponsors public sponsors;
    MockJackpot public jackpot;
    address public admin = address(0x123);
    address public sponsor1 = address(0x456);
    address public sponsor2 = address(0x789);

    function setUp() public {
        jackpot = new MockJackpot();
        vm.prank(admin);
        sponsors = new Sponsors(address(jackpot));
    }

    function testGetTierPrice() public view {
        assertEq(sponsors.tierPrice(Sponsors.Tier.Gold), 0.01 ether);
        assertEq(sponsors.tierPrice(Sponsors.Tier.Silver), 0.0069 ether);
        assertEq(sponsors.tierPrice(Sponsors.Tier.Bronze), 0.0042 ether);
    }

    function testSponsorizeGoldSuccess() public {
        vm.deal(sponsor1, 1 ether);

        vm.expectEmit(true, true, true, true);
        emit Sponsors.NewSponsor(
            0,
            sponsor1,
            0.01 ether,
            Sponsors.Tier.Gold,
            "GoldCo",
            "Join Now",
            "Best Co",
            "ipfs://logo",
            "https://goldco.xyz"
        );

        vm.prank(sponsor1);
        sponsors.sponsorize{value: 0.01 ether}(
            0,
            Sponsors.Tier.Gold,
            "GoldCo",
            "Join Now",
            "Best Co",
            "https://goldco.xyz",
            "ipfs://logo"
        );

        Sponsors.Ad[6] memory ads = sponsors.adsOfWeek(0);
        Sponsors.Ad memory ad = ads[0];
        assertEq(ad.sponsor, sponsor1);
        assertEq(ad.amountDonated, 0.01 ether);
        assertEq(ad.name, "GoldCo");
    }

    function testSponsorizeBronzeMultiple() public {
        vm.deal(sponsor1, 1 ether);
        vm.deal(sponsor2, 1 ether);

        // First bronze
        vm.prank(sponsor1);
        sponsors.sponsorize{value: 0.0042 ether}(
            0,
            Sponsors.Tier.Bronze,
            "Bronze1",
            "Play",
            "For gamers by gamers",
            "https://bronze1game.xyz",
            "ipfs://logo"
        );

        // Second bronze
        vm.prank(sponsor2);
        sponsors.sponsorize{value: 0.0042 ether}(
            0,
            Sponsors.Tier.Bronze,
            "Bronze2",
            "Open",
            "Affordable",
            "https://bronze2app.xyz",
            "ipfs://logo"
        );

        uint256 week = 0;
        // three and four are 2 of the 3 bronzes slots
        assertEq(sponsors.adsOfWeek(week)[3].sponsor, sponsor1);
        assertEq(sponsors.adsOfWeek(week)[4].sponsor, sponsor2);
    }

    function testSponsorizeFailsIfNotEnoughETH() public {
        vm.deal(sponsor1, 10 ether);
        vm.prank(sponsor1);
        vm.expectRevert("Not enough ETH for tier");
        sponsors.sponsorize{value: 0.0041 ether}(
           0,
            Sponsors.Tier.Bronze,
            "XXX",
            "x",
            "x",
            "x.com",
            "ipfs://x"
        );
    }

    function testSponsorizeFailsIfNoSlots() public {
        vm.deal(sponsor1, 10 ether);
        vm.deal(sponsor2, 10 ether);

        // Fill all bronze slots
        for (uint256 i = 0; i < 3; ++i) {
            vm.prank(sponsor1);
            sponsors.sponsorize{value: 0.0042 ether}(
                0,
                Sponsors.Tier.Bronze,
                string(abi.encodePacked("B", i)),
                "x",
                "x",
                "x.com",
                "ipfs://x"
            );
            vm.warp(block.timestamp + 1 days); // avoid nonce issues
        }

        // Try to add one more
        vm.prank(sponsor2);
        vm.expectRevert("No available slots for this tier this week");
        sponsors.sponsorize{value: 0.0042 ether}(
            0,
            Sponsors.Tier.Bronze,
            "XXX",
            "x",
            "x",
            "x.com",
            "ipfs://x"
        );
    }

    function testGetCurrentAds() public {
        vm.deal(sponsor1, 1 ether);
        vm.prank(sponsor1);
        sponsors.sponsorize{value: 0.01 ether}(
            0,
            Sponsors.Tier.Gold,
            "GoldCo",
            "Join Now",
            "Best Co",
            "https://goldco.xyz",
            "ipfs://logo"
        );

        Sponsors.Ad[6] memory ads = sponsors.currentAds();
        assertEq(ads[0].sponsor, sponsor1);
    }

    function testGetAdsByWeek() public {
        uint256 week = 0;

        vm.deal(sponsor1, 1 ether);
        vm.prank(sponsor1);
        sponsors.sponsorize{value: 0.0069 ether}(
            0,
            Sponsors.Tier.Silver,
            "SilverCo",
            "Click here",
            "Other Co",
            "https://silver.xyz",
            "ipfs://logo"
        );

        Sponsors.Ad[6] memory ads = sponsors.adsOfWeek(week);
        assertEq(ads[1].sponsor, sponsor1);
    }

    function testReceiveReverts() public {
        vm.deal(sponsor1, 3 ether);        
        vm.prank(sponsor1);
        vm.expectRevert("Please, call Sponsorize function");
        (bool success, ) = address(sponsors).call{value: 1 ether}("");
        assertEq(success, true);
    }
    
    function testFallbackReverts() public {
        vm.deal(sponsor1, 3 ether);        
        vm.prank(sponsor1);
        vm.expectRevert("Fallback not allowed");
        (bool success, ) = address(sponsors).call{value: 1 ether}("invalid");
        assertEq(success, true);
    }
}
