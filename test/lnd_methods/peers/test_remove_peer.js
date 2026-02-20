import { deepStrictEqual, rejects } from 'node:assert/strict';
import test from 'node:test';
import { removePeer } from '../../../index.js';

const tests = [
  {
    args: {},
    description: 'LND is required',
    error: [400, 'ExpectedLndForPeerDisconnection'],
  },
  {
    args: {lnd: {default: {disconnectPeer: ({}, cbk) => cbk('err')}}},
    description: 'A public key is expected',
    error: [400, 'ExpectedPublicKeyOfPeerToRemove'],
  },
  {
    args: {
      lnd: {default: {disconnectPeer: ({}, cbk) => cbk('err')}},
      public_key: Buffer.alloc(33, 3).toString('hex'),
    },
    description: 'Errors are passed back',
    error: [503, 'UnexpectedErrorRemovingPeer', {err: 'err'}],
  },
  {
    args: {
      lnd: {default: {disconnectPeer: ({}, cbk) => cbk()}},
      public_key: Buffer.alloc(33, 3).toString('hex'),
    },
    description: 'A peer is removed',
  },
];

for (const { args, description, error, expected } of tests) {
  test(description, async () => {
    if (error) {
      await rejects(() => removePeer(args), error, 'Got expected error');
    } else {
      const res = await removePeer(args);

      deepStrictEqual(res, expected, 'Got expected result');
    }
  });
}
