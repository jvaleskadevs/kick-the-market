import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("JackpotModule", (m) => {
  const JACKPOT_PRIZE_PERMIL = 69;
  const JACKPOT_WIN_ODDS = 69;
  const jackpot = m.contract(
    "Jackpot", 
    [JACKPOT_PRIZE_PERMIL, JACKPOT_WIN_ODDS]
  );

  return { jackpot };
});
