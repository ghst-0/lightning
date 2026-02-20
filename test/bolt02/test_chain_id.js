import { equal } from 'node:assert/strict';
import test from 'node:test';
import { chainId } from '../../bolt02/index.js';

const tests = [
  {
    args: {chain: 'bitcoin', network: 'mainnet'},
    description: 'Chain id returned',
    expected: '6fe28c0ab6f1b372c1a6a246ae63f74f931e8365e15a089c68d6190000000000',
  },
  {args: {chain: 'bitcoin'}, description: 'No chain means undefined id'},
  {args: {network: 'mainnet'}, description: 'No network means undefined id'},
  {args: {chain: 'c', network: 'n'}, description: 'No known chain/network'},
];

for (const { args, description, expected } of tests) {
  test(description, (t, end) => {
    const {chain} = chainId(args);

    equal(chain, expected, 'Chain id derived from chain and network');

    return end();
  });
}
