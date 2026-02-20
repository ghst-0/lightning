import { rejects } from 'node:assert/strict';
import test from 'node:test';
import { removeExternalSocket } from '../../../index.js';

const makeLnd = ({err}) => {
  return {peers: {updateNodeAnnouncement: (args, cbk) => cbk(err)}};
};

const makeArgs = overrides => {
  const args = {lnd: makeLnd({}), socket: '127.0.0.1:9735'};

  for (const key of Object.keys(overrides)) {
    args[key] = overrides[key]
  }

  return args;
};

const tests = [
  {
    args: makeArgs({lnd: undefined}),
    description: 'LND is required to remove an external socket',
    error: [400, 'ExpectedLndToRemoveExternalSocket'],
  },
  {
    args: makeArgs({socket: undefined}),
    description: 'A socket is required to remove an external socket',
    error: [400, 'ExpectedHostAndPortOfSocketToRemove'],
  },
  {
    args: makeArgs({
      lnd: makeLnd({err: {details: 'unknown service peersrpc.Peers'}}),
    }),
    description: 'LND with peersrpc is required to add an external socket',
    error: [400, 'ExpectedPeersRpcLndBuildTagToRemoveSocket'],
  },
  {
    args: makeArgs({lnd: makeLnd({err: 'err'})}),
    description: 'LND error is returned',
    error: [503, 'UnexpectedErrorRemovingExternalSocket', {err: 'err'}],
  },
  {
    args: makeArgs({}),
    description: 'Socket removed successfully',
  },
];

for (const { args, description, error, expected } of tests) {
  test(description, async () => {
    if (error) {
      await rejects(() => removeExternalSocket(args), error, 'Got error');
    } else {
      await removeExternalSocket(args);
    }
  });
}
