import { deepEqual } from 'node:assert/strict';
import test from 'node:test';
import { safeTokens } from '../../bolt00/index.js';

const tests = [
  {
    args: {mtokens: '1000'},
    description: 'When millitokens is not a fractional token, tokens returned',
    expected: {safe: 1, tokens: 1},
  },
  {
    args: {mtokens: '1001'},
    description: 'Safe tokens are rounded up, regular tokens rounded down',
    expected: {safe: 2, tokens: 1},
  },
  {
    args: {mtokens: '1999'},
    description: 'Any value of fractional token is rounded up',
    expected: {safe: 2, tokens: 1},
  },
  {
    args: {mtokens: '830497000'},
    description: 'A larger amount of mtokens is converted',
    expected: {safe: 830497, tokens: 830497},
  },
];

for (const { args, description, expected } of tests) {
  test(description, (t, end) => {
    const {safe, tokens} = safeTokens(args);

    deepEqual(safe, expected.safe, 'Got expected safe tokens');
    deepEqual(tokens, expected.tokens, 'Got expected tokens');

    return end();
  });
}
