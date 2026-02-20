import { rejects } from 'node:assert/strict';
import test from 'node:test';
import { deleteForwardingReputations } from '../../../index.js';

const tests = [
  {
    args: {},
    description: 'LND object is required',
    error: [400, 'ExpectedLndToDeleteForwardingReputations'],
  },
  {
    args: {lnd: {router: {resetMissionControl: ({}, cbk) => cbk('err')}}},
    description: 'An unexpected error is returned',
    error: [503, 'UnexpectedErrorResettingMissionControl', {err: 'err'}],
  },
  {
    args: {lnd: {router: {resetMissionControl: ({}, cbk) => cbk()}}},
    description: 'Forwarding reputations are deleted',
  },
];

for (const { args, description, error, expected } of tests) {
  test(description, async () => {
    if (error) {
      await rejects(deleteForwardingReputations(args), error, 'Got error');
    } else {
      await deleteForwardingReputations(args);
    }
  });
}
