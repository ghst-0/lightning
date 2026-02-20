import { rejects } from 'node:assert/strict';
import test from 'node:test';
import { stopDaemon } from '../../../index.js';

const makeLnd = ({attempts}) => {

  return {
    default: {
      getInfo: ({}, cbk) => {
        (attempts || []).push('err');

        if (!!attempts && attempts.length < 2) {
          return cbk('err');
        }

        return cbk({details: 'failed to connect to all addresses'});
      },
      stopDaemon: ({}, cbk) => cbk(),
    },
  };
};

const tests = [
  {
    args: {},
    description: 'LND is required to stop daemon',
    error: [400, 'ExpectedLndToStopDaemon'],
  },
  {
    args: {lnd: {default: {stopDaemon: ({}, cbk) => cbk('err')}}},
    description: 'Unexpected stop daemon errors are passed back',
    error: [503, 'UnexpectedErrorStoppingLightningDaemon', {err: 'err'}],
  },
  {
    args: {lnd: makeLnd({attempts: []})},
    description: 'LND is stopped after error',
  },
  {
    args: {lnd: makeLnd({})},
    description: 'LND is stopped',
  },
];

for (const { args, description, error, expected } of tests) {
  test(description, async () => {
    if (error) {
      await rejects(() => stopDaemon(args), error, 'Got error');
    } else {
      await stopDaemon(args);
    }
  });
}
