import 'node:assert';
import test from 'node:test';
import { deleteFailedPayments } from './../../../lnd_methods/index.js';

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

tests.forEach(({args, description, error, expected}) => {
  return test(description, async () => {
    if (error) {
      await rejects(deleteFailedPayments(args), error, 'Got expected err');
    } else {
      await deleteFailedPayments(args);
    }

    return;
  });
});
