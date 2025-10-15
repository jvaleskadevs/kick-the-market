import { signScore } from './lib/sign';

export default async function handler(req, res) {
  return await signScore(req, res);
}
