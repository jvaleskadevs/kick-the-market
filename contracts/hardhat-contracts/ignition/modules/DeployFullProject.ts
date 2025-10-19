import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("DeployFullProjectModule", (m) => {
  const JACKPOT_PRIZE_PERMIL = 69;
  const JACKPOT_WIN_ODDS = 69;
  const jackpot = m.contract(
    "Jackpot", 
    [JACKPOT_PRIZE_PERMIL, JACKPOT_WIN_ODDS],
  );

  const MINT_PRICE_FREE = 0;
  const ktmFree = m.contract(
    "KickTheMarket", 
    [MINT_PRICE_FREE, jackpot],
    { id: "KtmFreeMint"}
  );
  
  const MINT_PRICE_PAID = 270000000000000;
  const ktmPaid = m.contract(
    "KickTheMarket", 
    [MINT_PRICE_PAID, jackpot],
    { id: "KtmPaidMint"}
  );

  return { jackpot, ktmFree, ktmPaid };
});
