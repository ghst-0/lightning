import { rejects, deepStrictEqual } from 'node:assert/strict'
import test from 'node:test';
import { verifyMessage } from '../../../index.js';

const tests = [
  {
    args: {},
    description: 'An LND Object is required to verify a message',
    error: [400, 'ExpectedLndForVerifyMessage'],
  },
  {
    args: {lnd: {default: {verifyMessage: ({}, cbk) => {}}}},
    description: 'An message is required to verify a message',
    error: [400, 'ExpectedMessageToVerify'],
  },
  {
    args: {
      lnd: {default: {verifyMessage: ({}, cbk) => {}}},
      message: 'message',
    },
    description: 'An signature is required to verify a message',
    error: [400, 'ExpectedSignatureToVerifyAgainst'],
  },
  {
    args: {
      lnd: {default: {verifyMessage: ({}, cbk) => cbk('err')}},
      message: 'message',
      signature: 'signature',
    },
    description: 'Errors are passed back',
    error: [503, 'UnexpectedVerifyMessageError', {err: 'err'}],
  },
  {
    args: {
      lnd: {default: {verifyMessage: ({}, cbk) => cbk()}},
      message: 'message',
      signature: 'signature',
    },
    description: 'A response is expected',
    error: [503, 'ExpectedResultForVerifyMessageRequest'],
  },
  {
    args: {
      lnd: {default: {verifyMessage: ({}, cbk) => cbk(null, {})}},
      message: 'message',
      signature: 'signature',
    },
    description: 'Public key is expected',
    error: [503, 'ExpectedPublicKeyInVerifyMessageResponse'],
  },
  {
    args: {
      lnd: {default: {verifyMessage: ({}, cbk) => cbk(null, {pubkey: '000'})}},
      message: 'message',
      signature: 'signature',
    },
    description: 'Verified',
    expected: {signed_by: '000'},
  },
];

for (const { args, description, error, expected } of tests) {
  test(description, async () => {
    if (error) {
      await rejects(() => verifyMessage(args), error, 'Got expected error');
    } else {
      deepStrictEqual(await verifyMessage(args), expected, 'Got result');
    }
  });
}
