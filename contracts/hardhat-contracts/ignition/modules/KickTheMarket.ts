import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("KickTheMarketModule", (m) => {
  const MINT_PRICE = 270000000000000;
  const JACKPOT_ADDRESS = "0x8fe2e15D644baF41D40ba42f858c8B3b6Cb09b80";
  const ktm = m.contract("KickTheMarket", [MINT_PRICE, JACKPOT_ADDRESS], { id: "PAID"});

  return { ktm };
});
