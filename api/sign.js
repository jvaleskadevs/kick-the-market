import { signScore } from './lib/sign.js';

export default async function handler(req, res) {
  return await signScore(req, res);
}
