import { getHello } from '../src/lib/api/hello';

export default function handler(req, res) {
  return res.json(getHello());
}
