import { deepStrictEqual } from 'node:assert/strict';
import test from 'node:test';
import method from '../../../lnd_methods/signer/input_signing_method.js';

const makeArgs = override => {
  const args = {
    input: {
      root_hash: '00',
      witness_script: '00',
    },
    outputs: [{
      pk_script: Buffer.alloc(1),
      value: 1,
    }],
  };

  for (const key of Object.keys(override || {})) {
    args[key] = override[key]
  }

  return args;
};

const tests = [
  {
    args: makeArgs({}),
    description: 'Input signing method is returned for a leaf spend',
    expected: {method: 3},
  },
  {
    args: makeArgs({input: {}, outputs: undefined}),
    description: 'Input signing method is returned for a regular spend',
    expected: {method: 0},
  },
  {
    args: makeArgs({input: {}}),
    description: 'Input signing method is returned for a bip86 spend',
    expected: {method: 1},
  },
  {
    args: makeArgs({input: {root_hash: '00'}}),
    description: 'Input signing method is returned for a top key script spend',
    expected: {method: 2},
  },
];

for (const { args, description, expected } of tests) {
  test(description, (t, end) => {
    const res = method(args);

    deepStrictEqual(res, expected, 'Got expected result');

    return end();
  });
}
