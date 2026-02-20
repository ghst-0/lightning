import { rejects } from 'node:assert/strict';
import test from 'node:test';
import { deleteFailedPayments } from '../../../lnd_methods/index.js';

const tests = [
  {
    args: {},
    description: 'LND object is required',
    error: [400, 'ExpectedAuthenticatedLndToDeleteFailedPayments'],
  },
  {
    args: {lnd: {default: {deleteAllPayments: ({}, cbk) => cbk('err')}}},
    description: 'An unexpected error is returned',
    error: [503, 'UnexpectedErrorDeletingFailedPayments', {err: 'err'}],
  },
  {
    args: {lnd: {default: {deleteAllPayments: ({}, cbk) => cbk()}}},
    description: 'Failed payments are deleted',
  },
];

for (const { args, description, error, expected } of tests) {
  test(description, async () => {
    if (error) {
      await rejects(deleteFailedPayments(args), error, 'Got expected err');
    } else {
      await deleteFailedPayments(args);
    }
  });
}
