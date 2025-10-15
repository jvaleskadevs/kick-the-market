import { getHello } from './lib/hello';

export default function handler(req, res) {
  return res.json(getHello());
}
