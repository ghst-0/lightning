import { rejects } from 'node:assert/strict';
import test from 'node:test';
import { cancelPendingChannel } from '../../../lnd_methods/index.js';

const id = Buffer.alloc(32).toString('hex');

const tests = [
  {
    args: {},
    description: 'A pending channel id is required to cancel pending channel',
    error: [400, 'ExpectedPendingChannelIdToCancelPendingChannel'],
  },
  {
    args: {id},
    description: 'LND Object is required to cancel pending channel',
    error: [400, 'ExpectedAuthenticatedLndToCancelPendingChannel'],
  },
  {
    args: {id, lnd: {default: {fundingStateStep: ({}, cbk) => cbk('err')}}},
    description: 'Funding state step error is returned',
    error: [503, 'UnexpectedErrorCancelingPendingChannel', {err: 'err'}],
  },
  {
    args: {id, lnd: {default: {fundingStateStep: ({}, cbk) => cbk()}}},
    description: 'Funding state step is executed',
  },
];

for (const { args, description, error, expected } of tests) {
  test(description, async () => {
    if (error) {
      await rejects(() => cancelPendingChannel(args), error, 'Got error');
    } else {
      await cancelPendingChannel(args);
    }
  });
}
