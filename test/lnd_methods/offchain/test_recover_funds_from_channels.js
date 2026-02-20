import { deepStrictEqual, rejects } from 'node:assert/strict';
import test from 'node:test';
import { recoverFundsFromChannels } from '../../../index.js';

const tests = [
  {
    args: {},
    description: 'A backup to verify is required',
    error: [400, 'ExpectedBackupWhenAttemptingRestoreChannelFunds'],
  },
  {
    args: {backup: '00'},
    description: 'An authenticated LND object is required',
    error: [400, 'ExpectedLndWhenAttemptingToRestoreChannelFunds'],
  },
  {
    args: {
      backup: '00',
      lnd: {default: {restoreChannelBackups: ({}, cbk) => cbk('err')}},
    },
    description: 'LND errors are passed back',
    error: [503, 'UnexpectedErrWhenRestoringChannelFunds', {err: 'err'}],
  },
  {
    args: {
      backup: '00',
      lnd: {
        default: {
          restoreChannelBackups: ({}, cbk) => cbk(),
          verifyChanBackup: ({}, cbk) => cbk(),
        },
      },
    },
    description: 'Funds are recovered',
  },
];

for (const { args, description, error, expected } of tests) {
  test(description, async () => {
    if (error) {
      await rejects(recoverFundsFromChannels(args), error, 'Got error');
    } else {
      const res = await recoverFundsFromChannels(args);

      deepStrictEqual(res, expected, 'Got expected result');
    }
  });
}
