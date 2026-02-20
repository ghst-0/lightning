import { deepStrictEqual, rejects } from 'node:assert/strict';
import test from 'node:test';
import { getWalletVersion } from '../../../index.js';

const makeResponse = overrides => {
  const response = {
    app_minor: 1,
    app_patch: 1,
    build_tags: ['autopilotrpc'],
    commit_hash: Buffer.alloc(20).toString('hex'),
  };

  for (const k of Object.keys(overrides)) {
    response[k] = overrides[k]
  }

  return response;
};

const makeLnd = ({err, res}) => {
  const response = makeResponse({});

  return {
    version: {
      getVersion: ({}, cbk) => cbk(err, res === undefined ? response : res),
    },
  };
};

const tests = [
  {
    args: {},
    description: 'LND is required to get version',
    error: [400, 'ExpectedAuthenticatedLndForGetVersionRequest'],
  },
  {
    args: {lnd: makeLnd({err: 'err'})},
    description: 'Errors are passed back',
    error: [503, 'UnexpectedGetWalletVersion', {err: 'err'}],
  },
  {
    args: {lnd: makeLnd({err: {details: 'unknown service verrpc.Versioner'}})},
    description: 'Errors are passed back',
    error: [501, 'VersionMethodUnsupported'],
  },
  {
    args: {lnd: makeLnd({res: null})},
    description: 'Response is required',
    error: [503, 'ExpectedResponseForGetVersion'],
  },
  {
    args: {lnd: makeLnd({res: makeResponse({app_minor: undefined})})},
    description: 'Minor version is expected',
    error: [503, 'ExpectedAppMinorVersionInGetVersionResponse'],
  },
  {
    args: {lnd: makeLnd({res: makeResponse({app_patch: undefined})})},
    description: 'Patch version is expected',
    error: [503, 'ExpectedAppMinorVersionInGetVersionResponse'],
  },
  {
    args: {lnd: makeLnd({res: makeResponse({build_tags: undefined})})},
    description: 'Build tags are expected',
    error: [503, 'ExpectedArrayOfBuildTagsInGetVersionResponse'],
  },
  {
    args: {lnd: makeLnd({res: makeResponse({commit_hash: 'commit_hash'})})},
    description: 'Commit hash is expected',
    error: [503, 'ExpectedCommitHashInGetVersionResponse'],
  },
  {
    args: {lnd: makeLnd({})},
    description: 'Version information is returned',
    expected: {
      build_tags: ['autopilotrpc'],
      commit_hash: '0000000000000000000000000000000000000000',
      is_autopilotrpc_enabled: true,
      is_chainrpc_enabled: false,
      is_invoicesrpc_enabled: false,
      is_signrpc_enabled: false,
      is_walletrpc_enabled: false,
      is_watchtowerrpc_enabled: false,
      is_wtclientrpc_enabled: false,
      version: undefined,
    },
  },
];

for (const { args, description, error, expected } of tests) {
  test(description, async () => {
    if (error) {
      await rejects(() => getWalletVersion(args), error, 'Got error');
    } else {
      deepStrictEqual(await getWalletVersion(args), expected, 'Got info');
    }
  });
}
