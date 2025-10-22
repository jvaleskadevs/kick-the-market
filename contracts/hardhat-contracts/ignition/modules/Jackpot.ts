import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("JackpotModule0", (m) => {
  const JACKPOT_PRIZE_PERMIL = 69;
  const JACKPOT_WIN_ODDS = 69;
  const jackpot = m.contract(
    "contracts/JackpotV2.sol:Jackpot", 
    [JACKPOT_PRIZE_PERMIL, JACKPOT_WIN_ODDS],
    { id: "JackpotV2" }
  );

  return { jackpot };
});
