import { rejects } from 'node:assert/strict';
import test from 'node:test';
import { updateAlias } from '../../../index.js';

const makeLnd = ({err}) => {
  return {peers: {updateNodeAnnouncement: (args, cbk) => cbk(err)}};
};

const makeArgs = overrides => {
  const args = {alias: 'alias', lnd: makeLnd({})};

  for (const key of Object.keys(overrides)) {
    args[key] = overrides[key]
  }

  return args;
};

const tests = [
  {
    args: makeArgs({alias: undefined}),
    description: 'An alias is required to update alias to',
    error: [400, 'ExpectedAliasToUpdateNodeAnnouncementAlias'],
  },
  {
    args: makeArgs({lnd: undefined}),
    description: 'LND is required to update alias',
    error: [400, 'ExpectedLndToUpdateNodeAnnouncementAlias'],
  },
  {
    args: makeArgs({
      lnd: makeLnd({err: {details: 'unknown service peersrpc.Peers'}}),
    }),
    description: 'LND with peersrpc is required to update alias',
    error: [400, 'ExpectedPeersRpcLndBuildTagToUpdateAlias'],
  },
  {
    args: makeArgs({lnd: makeLnd({err: 'err'})}),
    description: 'LND error is returned',
    error: [503, 'UnexpectedErrorUpdatingNodeAlias', {err: 'err'}],
  },
  {
    args: makeArgs({}),
    description: 'Alias updated successfully',
  },
];

for (const { args, description, error, expected } of tests) {
  test(description, async () => {
    if (error) {
      await rejects(() => updateAlias(args), error, 'Got error');
    } else {
      await updateAlias(args);
    }
  });
}
