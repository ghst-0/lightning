import asyncAuto from 'async/auto.js';
import { returnResult } from 'asyncjs-util';

import { isLnd } from '../../lnd_requests/index.js';

const hexAsBuffer = hex => Buffer.from(hex, 'hex');
const isHex = n => !!n && !(n.length % 2) && /^[0-9A-F]*$/i.test(n);
const method = 'restoreChannelBackups';
const type = 'default';

/** Verify and restore channels from a multi-channel backup

  Requires `offchain:write` permission

  {
    backup: <Backup Hex String>
    lnd: <Authenticated LND API Object>
  }

  @returns via cbk or Promise
*/
export default ({backup, lnd}, cbk) => {
  return new Promise((resolve, reject) => {
    asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!isHex(backup)) {
          return cbk([400, 'ExpectedBackupWhenAttemptingRestoreChannelFunds']);
        }

        if (!isLnd({lnd, method, type})) {
          return cbk([400, 'ExpectedLndWhenAttemptingToRestoreChannelFunds']);
        }

        return cbk();
      },

      // Restore backups
      restore: ['validate', ({}, cbk) => {
        return lnd[type][method]({
          multi_chan_backup: hexAsBuffer(backup),
        },
        err => {
          if (err) {
            return cbk([503, 'UnexpectedErrWhenRestoringChannelFunds', {err}]);
          }

          return cbk();
        });
      }],
    },
    returnResult({reject, resolve}, cbk));
  });
};
