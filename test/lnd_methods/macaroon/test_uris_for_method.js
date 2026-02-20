import { deepStrictEqual, throws } from 'node:assert/strict';
import test from 'node:test';
import method from '../../../lnd_methods/macaroon/uris_for_method.js';
import methods from '../../../lnd_methods/macaroon/methods.json' with { type: 'json' };

const tests = [
  {
    args: {},
    description: 'A method is required',
    error: 'ExpectedMethodNameToDeriveMacaroonUris',
  },
  {
    args: {method: 'unknown'},
    description: 'A known method is required',
    error: 'ExpectedKnownMethodNameToDeriveMacaroonUris',
  },
  {
    args: {method: 'getPayment'},
    description: 'Router server URI is returned',
    expected: {uris: ['/routerrpc.Router/TrackPaymentV2']},
  },
  {
    args: {method: 'grantAccess'},
    description: 'Method URI is returned',
    expected: {uris: ['/lnrpc.Lightning/BakeMacaroon']},
  },
];

for (const { args, description, error, expected } of tests) {
  test(description, (t, end) => {
    if (error) {
      throws(() => method(args), new Error(error), 'Got expected error');
    } else {
      const res = method(args);

      deepStrictEqual(res, expected, 'Got expected result');
    }

    // Run through all the methods to make sure they can be derived
    for (const n of Object.keys(methods)) {
      method({ method: n })
    }

    return end();
  });
}
