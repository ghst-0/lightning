import asyncAuto from 'async/auto.js';
import asyncRetry from 'async/retry.js';
import { returnResult } from 'asyncjs-util';

import getWalletInfo from './get_wallet_info.js';
import { isLnd } from '../../lnd_requests/index.js';

const interval = retryCount => 10 * 2 ** retryCount;
const method = 'stopDaemon';
const times = 10;
const type = 'default';

/** Stop the Lightning daemon.

  Requires `info:write` permission

  {
    lnd: <Authenticated LND API Object>
  }

  @returns via cbk or Promise
*/
export default ({lnd}, cbk) => {
  return new Promise((resolve, reject) => {
    asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!isLnd({method, lnd, type})) {
          return cbk([400, 'ExpectedLndToStopDaemon']);
        }

        return cbk();
      },

      // Stop the daemon
      stopDaemon: ['validate', ({}, cbk) => {
        return lnd[type][method]({}, err => {
          if (err) {
            return cbk([503, 'UnexpectedErrorStoppingLightningDaemon', {err}]);
          }

          return cbk();
        });
      }],

      // Poll wallet info until it fails to know when the daemon is really off
      waitForGetInfoFailure: ['stopDaemon', ({stopDaemon}, cbk) => {
        return asyncRetry({interval, times}, cbk => {
          return getWalletInfo({lnd}, err => {
            if (!err) {
              return cbk([503, 'ExpectedDaemonError']);
            }

            const [, message] = err;

            if (message !== 'FailedToConnectToDaemon') {
              return cbk([503, 'ExpectedDaemonShutdown']);
            }

            return cbk();
          });
        },
        cbk);
      }],
    },
    returnResult({reject, resolve}, cbk));
  });
};
