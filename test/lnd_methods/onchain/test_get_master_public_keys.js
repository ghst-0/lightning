import { deepStrictEqual, rejects } from 'node:assert/strict';
import test from 'node:test';
import { getMasterPublicKeys } from '../../../lnd_methods/index.js';

const makeExpected = overrides => {
  const res = {
    derivation_path: 'derivation_path',
    extended_public_key: 'extended_public_key',
    external_key_count: 0,
    internal_key_count: 1,
    is_watch_only: true,
    named: 'name',
  };

  for (const k of Object.keys(overrides)) {
    res[k] = overrides[k]
  }

  return {keys: [res]};
};

const makeLnd = overrides => {
  return {
    wallet: {
      listAccounts: ({}, cbk) => {
        const account = {
          derivation_path: 'derivation_path',
          extended_public_key: 'extended_public_key',
          external_key_count: 0,
          internal_key_count: 1,
          name: 'name',
          watch_only: true,
        };

        for (const k of Object.keys(overrides)) {
          account[k] = overrides[k]
        }

        return cbk(null, {accounts: [account]});
      },
    },
  };
};

const tests = [
  {
    args: {},
    description: 'LND Object is required to get master public keys',
    error: [400, 'ExpectedAuthenticatedLndToGetMasterPublicKeys'],
  },
  {
    args: {
      lnd: {
        wallet: {
          listAccounts: ({}, cbk) => cbk({
            details: 'unknown walletrpc.WalletKit',
          }),
        },
      },
    },
    description: 'LND unsupported errors are passed back',
    error: [501, 'GetMasterPublicKeysMethodNotSupported'],
  },
  {
    args: {lnd: {wallet: {listAccounts: ({}, cbk) => cbk('err')}}},
    description: 'LND errors are passed back',
    error: [503, 'UnexpectedErrorGettingMasterPublicKeys', {err: 'err'}],
  },
  {
    args: {lnd: {wallet: {listAccounts: ({}, cbk) => cbk()}}},
    description: 'A response is expected',
    error: [503, 'ExpectedResultForMasterPublicKeyListRequest'],
  },
  {
    args: {lnd: {wallet: {listAccounts: ({}, cbk) => cbk(null, {})}}},
    description: 'A response with accounts is expected',
    error: [503, 'ExpectedArrayOfAccountsInMasterPublicKeysList'],
  },
  {
    args: {lnd: makeLnd({})},
    description: 'Get a list of master public keys',
    expected: makeExpected({}),
  },
];

for (const { args, description, error, expected } of tests) {
  test(description, async () => {
    if (error) {
      await rejects(() => getMasterPublicKeys(args), error, 'Got error');
    } else {
      const {keys} = await getMasterPublicKeys(args);

      deepStrictEqual(keys, expected.keys, 'Got keys');
    }
  });
}
