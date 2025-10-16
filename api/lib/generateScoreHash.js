import { keccak256, toHex } from 'viem';

export function generateScoreHash(score, anomalyLevel, blackSwanLevel, totalClicks) {
  const data = `${score}-${anomalyLevel}-${blackSwanLevel}-${totalClicks}`;//-${Date.now()}`;
  return keccak256(toHex(data));
}
