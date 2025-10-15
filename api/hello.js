import { getHello } from './lib/hello.js';

export default function handler(req, res) {
  return res.json(getHello());
}
