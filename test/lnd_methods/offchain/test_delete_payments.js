import 'node:assert';
import test from 'node:test';
import { deletePayments } from './../../../index.js';

const tests = [
  {
    args: {},
    description: 'LND object is required',
    error: [400, 'ExpectedAuthenticatedLndToDeleteAllPayments'],
  },
  {
    args: {lnd: {default: {deleteAllPayments: ({}, cbk) => cbk('err')}}},
    description: 'An unexpected error is returned',
    error: [503, 'UnexpectedErrorDeletingAllPayments', {err: 'err'}],
  },
  {
    args: {lnd: {default: {deleteAllPayments: ({}, cbk) => cbk()}}},
    description: 'Payment is deleted',
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async () => {
    if (error) {
      await rejects(deletePayments(args), error, 'Got expected error');
    } else {
      await deletePayments(args);
    }

    return;
  });
});
