import { deepEqual, throws } from 'node:assert/strict';
import test from 'node:test';
import { mtokensAmount } from '../../bolt00/index.js';

const tests = [
  {
    args: {},
    description: 'Default mtokens is undefined',
    expected: {},
  },
  {
    args: {tokens: 0},
    description: 'Tokens can be zero',
    expected: {mtokens: '0'},
  },
  {
    args: {tokens: 1},
    description: 'Tokens are converted to mtokens',
    expected: {mtokens: '1000'},
  },
  {
    args: {tokens: 'invalid number'},
    description: 'Tokens must be a valid number',
    error: 'ExpectedEitherTokensNumberOrMtokensStringForAmountValue',
  },
  {
    args: {mtokens: '1000'},
    description: 'Mtokens are returned',
    expected: {mtokens: '1000'},
  },
  {
    args: {mtokens: '1000', tokens: 2},
    description: 'Mtokens and tokens must agree',
    error: 'ExpectedEqualValuesForTokensAndMtokens',
  },
  {
    args: {mtokens: '1000', tokens: 1},
    description: 'Mtokens are returned when tokens are equivalent',
    expected: {mtokens: '1000'},
  },
];

for (const { args, description, error, expected } of tests) {
  test(description, (t, end) => {
    if (error) {
      throws(() => {
        console.log('mtokensAmount(args)')
        mtokensAmount(args)
      }, new Error(error), 'Got expected err');
    } else {
      const {mtokens} = mtokensAmount(args);

      deepEqual(mtokens, expected.mtokens, 'Got expected output');
    }

    return end();
  });
}
