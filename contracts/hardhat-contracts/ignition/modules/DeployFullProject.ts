import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("DeployFullProjectModule", (m) => {
  // deploy jackpot first
  const JACKPOT_PRIZE_PERMIL = 69;
  const JACKPOT_WIN_ODDS = 69;
  const jackpot = m.contract(
    "contracts/JackpotV2.sol:Jackpot", 
    [JACKPOT_PRIZE_PERMIL, JACKPOT_WIN_ODDS],
    { id: "JackpotBase"}
  );
  // deploy free mint KTM game
  const MINT_PRICE_FREE = 0;
  const ktmFree = m.contract(
    "contracts/KickTheMarketV3.sol:KickTheMarket", 
    [MINT_PRICE_FREE, jackpot],
    { id: "KtmFreeMintBase"}
  );
  // deploy paid mint KTM game
  const MINT_PRICE_PAID = 270000000000000;
  const ktmPaid = m.contract(
    "contracts/KickTheMarketV3.sol:KickTheMarket", 
    [MINT_PRICE_PAID, jackpot],
    { id: "KtmPaidMintBase"}
  );
  
  // grant jackpot game role to the games
  //const JACKPOT_GAME_ROLE = m.staticCall(jackpot, "JACKPOT_GAME_ROLE", []);
  const JACKPOT_GAME_ROLE = "0x5b8b382ad6d95db02987b837e3fdc8ec0a744175ef19c16713bfc6a4e3bab625";
  m.call(jackpot, "grantRole", [JACKPOT_GAME_ROLE, ktmFree], { id: "JackpotGrantRoleFreeBase"});
  m.call(jackpot, "grantRole", [JACKPOT_GAME_ROLE, ktmPaid], { id: "JackpotGrantRolePaidBase"});
  
  // deploy sponsors
  const sponsors = m.contract(
    "contracts/Sponsors.sol:Sponsors",
    [jackpot],
    { id: "SponsorsBase"}
  );

  return { jackpot, ktmFree, ktmPaid, sponsors };
});
