import { strictEqual, rejects } from 'node:assert/strict';
import test from 'node:test';
import { getMinimumRelayFee } from '../../../lnd_methods/index.js';

const tests = [
  {
    args: {},
    description: 'LND is required',
    error: [400, 'ExpectedAuthenticatedLndToGetMinRelayFeeRate'],
  },
  {
    args: {lnd: {}},
    description: 'LND with wallet object is required',
    error: [400, 'ExpectedAuthenticatedLndToGetMinRelayFeeRate'],
  },
  {
    args: {lnd: {wallet: {}}},
    description: 'LND with estimateFee method is required',
    error: [400, 'ExpectedAuthenticatedLndToGetMinRelayFeeRate'],
  },
  {
    args: {
      lnd: {wallet: {estimateFee: ({}, cbk) => cbk('err')}},
    },
    description: 'Unexpected errors are passed back',
    error: [503, 'UnexpectedErrorGettingMinRateFromLnd', {err: 'err'}],
  },
  {
    args: {
      lnd: {wallet: {estimateFee: ({}, cbk) => cbk()}},
    },
    description: 'A response is expected',
    error: [503, 'ExpectedResponseForMinFeeRateRequest'],
  },
  {
    args: {
      lnd: {wallet: {estimateFee: ({}, cbk) => cbk(null, {})}},
    },
    description: 'A response is expected',
    error: [503, 'ExpectedMinPerKwResponseForMinFeeRateRequest'],
  },
  {
    args: {
      lnd: {
        wallet: {
          estimateFee: ({}, cbk) => cbk(null, {
            min_relay_fee_sat_per_kw: '250',
          }),
        },
      },
    },
    description: 'Minimum tokens per vbyte are returned',
    expected: {tokens_per_vbyte: 1},
  },
];

for (const { args, description, error, expected } of tests) {
  test(description, async () => {
    if (error) {
      await rejects(getMinimumRelayFee(args), error, 'Got expected error');
    } else {
      const res = await getMinimumRelayFee(args);

      strictEqual(res.tokens_per_vbyte, expected.tokens_per_vbyte, 'Got rate');
    }
  });
}
