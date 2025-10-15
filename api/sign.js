import { signScore } from '../src/lib/api/sign';

export default async function handler(req, res) {
  return await signScore(req, res);
}
