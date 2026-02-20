import { rejects } from 'node:assert/strict';
import test from 'node:test';
import { getInvoice } from '../../../index.js';
import { lookupInvoiceResponse } from '../fixtures/index.js';

const id = Buffer.alloc(32).toString('hex');

const tests = [
  {
    args: {},
    description: 'An id of an invoice to get is required',
    error: [400, 'ExpectedIdToGetInvoiceDetails'],
  },
  {
    args: {id: 'foo'},
    description: 'A hex id of an invoice to get is required',
    error: [400, 'ExpectedIdToGetInvoiceDetails'],
  },
  {
    args: {id},
    description: 'LND is required',
    error: [400, 'ExpectedLndToGetInvoiceDetails'],
  },
  {
    args: {id, lnd: {default: {lookupInvoice: ({}, cbk) => cbk('err')}}},
    description: 'Errors are passed back',
    error: [503, 'UnexpectedLookupInvoiceErr', {err: 'err'}],
  },
  {
    args: {id, lnd: {default: {lookupInvoice: ({}, cbk) => cbk(null, {})}}},
    description: 'Errors are passed back',
    error: [503, 'ExpectedInvoiceCreationDateInResponse'],
  },
  {
    args: {
      id,
      lnd: {
        default: {
          lookupInvoice: ({}, cbk) => cbk(null, lookupInvoiceResponse({})),
        },
      },
    },
    description: 'Invoice is returned',
    expected: {},
  },
];

for (const { args, description, error } of tests) {
  test(description, async () => {
    if (error) {
      await rejects(getInvoice(args), error, 'Got expected err');
    } else {
      await getInvoice(args);
    }
  });
}
