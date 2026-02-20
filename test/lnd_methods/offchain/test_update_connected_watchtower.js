import { rejects } from 'node:assert/strict';
import test from 'node:test';
import { updateConnectedWatchtower } from '../../../lnd_methods/index.js';

const makeLnd = err => {
  return {
    tower_client: {
      addTower: ({}, cbk) => cbk(),
      removeTower: ({}, cbk) => cbk(err),
    },
  };
};

const makeArgs = override => {
  const args = {
    add_socket: 'add',
    lnd: makeLnd(),
    public_key: Buffer.alloc(33, 3).toString('hex'),
    remove_socket: 'remove',
  };

  for (const key of Object.keys(override || {})) {
    args[key] = override[key]
  }

  return args;
};

const tests = [
  {
    args: makeArgs({add_socket: undefined, remove_socket: undefined}),
    description: 'An add or remove socket is required',
    error: [400, 'ExpectedASocketToAddToOrRemoveFromWatchtower'],
  },
  {
    args: makeArgs({lnd: undefined}),
    description: 'LND is required',
    error: [400, 'ExpectedAuthenticatedLndToUpdateWatchtower'],
  },
  {
    args: makeArgs({public_key: undefined}),
    description: 'A public key is required',
    error: [400, 'ExpectedPublicKeyToUpdateWatchtower'],
  },
  {
    args: makeArgs({
      lnd: makeLnd({
        message: '12 UNIMPLEMENTED: unknown service wtclientrpc.WatchtowerClient',
      }),
    }),
    description: 'Unimplemented error is returned',
    error: [501, 'ExpectedWatchtowerClientLndToGetPolicy'],
  },
  {
    args: makeArgs({
      lnd: {
        tower_client: {
          addTower: ({}, cbk) => cbk('err'),
          removeTower: ({}, cbk) => cbk(),
        },
      },
    }),
    description: 'Add socket error is returned',
    error: [503, 'UnexpectedAddSocketToWatchtowerError', {err: 'err'}],
  },
  {
    args: makeArgs({add_socket: undefined, lnd: makeLnd('err')}),
    description: 'Server error is returned',
    error: [503, 'UnexpectedRemoveSocketFromTowerError', {err: 'err'}],
  },
  {
    args: makeArgs({remove_socket: undefined}),
    description: 'A socket is added',
  },
  {
    args: makeArgs({}),
    description: 'A socket is added and a socket is removed',
  },
];

for (const { args, description, error, expected } of tests) {
  test(description, async () => {
    if (error) {
      await rejects(updateConnectedWatchtower(args), error, 'Got error');
    } else {
      await updateConnectedWatchtower(args);
    }
  });
}
