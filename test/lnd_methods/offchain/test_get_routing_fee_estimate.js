import { deepStrictEqual, rejects } from 'node:assert/strict';
import test from 'node:test';
import { getRoutingFeeEstimate } from '../../../index.js';

const makeLnd = ({err, res}) => {
  const r = {
    routing_fee_msat: '1',
    time_lock_delay: '1',
    failure_reason: 'FAILURE_REASON_NONE',
  };

  return {
    router: {
      estimateRouteFee: ({}, cbk) => cbk(err, res === undefined ? r : res),
    },
  };
};

const makeArgs = override => {
  const args = {lnd: makeLnd({}), request: 'request'};

  for (const key of Object.keys(override || {})) {
    args[key] = override[key]
  }

  return args;
};

const tests = [
  {
    args: makeArgs({lnd: undefined}),
    description: 'LND is required',
    error: [400, 'ExpectedAuthenticatedLndToGetRoutingFeeEstimate'],
  },
  {
    args: makeArgs({request: undefined}),
    description: 'Request is required',
    error: [400, 'ExpectedPaymentRequestToGetRoutingFeeEstimate'],
  },
  {
    args: makeArgs({}),
    description: 'A route fee estimate is returned',
    expected: {fee_mtokens: '1', timeout: 1},
  },
  {
    args: makeArgs({lnd: makeLnd({err: 'err'})}),
    description: 'An error is not expected',
    error: [503, 'UnexpectedGetRoutingFeeEstimateError', {err: 'err'}],
  },
  {
    args: makeArgs({lnd: makeLnd({res: null})}),
    description: 'A result is expected',
    error: [503, 'ExpectedGetRoutingFeeEstimateResponse'],
  },
  {
    args: makeArgs({lnd: makeLnd({res: {}})}),
    description: 'A result fee is expected',
    error: [503, 'ExpectedFeeInGetRoutingFeeEstimateResponse'],
  },
  {
    args: makeArgs({lnd: makeLnd({res: {routing_fee_msat: '1'}})}),
    description: 'A result timeout is expected',
    error: [503, 'ExpectedTimeoutInGetRouteFeeEstimateResponse'],
  },
  {
    args: makeArgs({
      lnd: makeLnd({res: {routing_fee_msat: '1', time_lock_delay: '1'}}),
    }),
    description: 'A result non failure code is expected',
    error: [404, 'RouteToDestinationNotFound', {failure: undefined}],
  },
];

for (const { args, description, error, expected } of tests) {
  test(description, async () => {
    if (error) {
      await rejects(getRoutingFeeEstimate(args), error, 'Got expected error');
    } else {
      deepStrictEqual(await getRoutingFeeEstimate(args), expected, 'Got res');
    }
  });
}
