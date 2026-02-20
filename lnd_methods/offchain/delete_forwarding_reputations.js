import asyncAuto from 'async/auto.js';
import { returnResult } from 'asyncjs-util';

import { isLnd } from '../../lnd_requests/index.js';

const method = 'resetMissionControl';
const type = 'router';

/** Delete all forwarding reputations

  Requires `offchain:write` permission

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
        if (!isLnd({lnd, method, type})) {
          return cbk([400, 'ExpectedLndToDeleteForwardingReputations']);
        }

        return cbk();
      },

      // Delete reputations
      deleteReputations: ['validate', ({}, cbk) => {
        return lnd[type][method]({}, err => {
          if (err) {
            return cbk([503, 'UnexpectedErrorResettingMissionControl', {err}]);
          }

          return cbk();
        });
      }],
    },
    returnResult({reject, resolve}, cbk));
  });
};
