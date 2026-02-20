import asyncAuto from 'async/auto.js';
import { returnResult } from 'asyncjs-util';

import { isLnd } from '../../lnd_requests/index.js';
import verifyBackup from './verify_backup.js';

const existsErr = 'unable to unpack single backups: channel already exists';
const hexAsBuffer = hex => Buffer.from(hex, 'hex');
const method = 'restoreChannelBackups';
const type = 'default';

/** Verify and restore a channel from a single channel backup

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
        if (!backup) {
          return cbk([400, 'ExpectedBackupWhenAttemptingChannelRestoration']);
        }

        if (!isLnd({lnd, method, type})) {
          return cbk([400, 'ExpectedLndToRestoreChannelFromBackup']);
        }

        return cbk();
      },

      // Check the backup
      checkBackup: ['validate', ({}, cbk) => verifyBackup({backup, lnd}, cbk)],

      // Attempt restore
      restoreChannel: ['checkBackup', ({checkBackup}, cbk) => {
        if (!checkBackup.is_valid) {
          return cbk([400, 'ProvidedBackupIsInvalid']);
        }

        return lnd[type][method]({
          chan_backups: {chan_backups: [{chan_backup: hexAsBuffer(backup)}]},
        },
        err => {
          if (err && err.details === existsErr) {
            return cbk([400, 'ChannelAlreadyExists']);
          }

          if (err) {
            return cbk([503, 'UnexpectedErrorRestoringChanFromBackup', {err}]);
          }

          return cbk(null, {});
        });
      }],
    },
    returnResult({reject, resolve, of: 'restoreChannel'}, cbk));
  });
};
