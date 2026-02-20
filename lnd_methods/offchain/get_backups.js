import asyncAuto from 'async/auto.js';
import { returnResult } from 'asyncjs-util';

import { backupsFromSnapshot } from '../../lnd_responses/index.js';
import { isLnd } from '../../lnd_requests/index.js';

const method = 'exportAllChannelBackups';
const type = 'default';

/** Get all channel backups

  Requires `offchain:read` permission

  {
    lnd: <Authenticated LND API Object>
  }

  @returns via cbk or Promise
  {
    backup: <All Channels Backup Hex String>
    channels: [{
      backup: <Individualized Channel Backup Hex String>
      transaction_id: <Channel Funding Transaction Id Hex String>
      transaction_vout: <Channel Funding Transaction Output Index Number>
    }]
  }
*/
export default ({lnd}, cbk) => {
  return new Promise((resolve, reject) => {
    asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!isLnd({lnd, method, type})) {
          return cbk([400, 'ExpectedLndGrpcToExportAllChannelBackups']);
        }

        return cbk();
      },

      // Get backups snapshot
      getBackupsSnapshot: ['validate', ({}, cbk) => {
        return lnd[type][method]({}, (err, res) => {
          if (err) {
            return cbk([503, 'UnexpectedErrorGettingAllChanBackups', {err}]);
          }

          if (!res) {
            return cbk([503, 'ExpectedChanBackupsResponseForBackupsRequest']);
          }

          return cbk(null, backupsFromSnapshot(res));
        });
      }],
    },
    returnResult({reject, resolve, of: 'getBackupsSnapshot'}, cbk));
  });
};
