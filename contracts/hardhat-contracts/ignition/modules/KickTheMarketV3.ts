import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("KickTheMarketModule", (m) => {
  const MINT_PRICE = 270000000000000;
  const JACKPOT_ADDRESS = "0x5667e3FEe8E7762D9515EcD65e09bC80BF116FA0";
  const ktm = m.contract("contracts/KickTheMarketV3.sol:KickTheMarket", [MINT_PRICE, JACKPOT_ADDRESS], { id: "v3paid" });
  const ktmFree = m.contract("contracts/KickTheMarketV3.sol:KickTheMarket", [0, JACKPOT_ADDRESS], { id: "v3free" });

  return { ktm, ktmFree };
});
