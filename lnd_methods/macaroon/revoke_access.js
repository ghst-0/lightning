import asyncAuto from 'async/auto.js';
import { returnResult } from 'asyncjs-util';

import { isLnd } from './../../lnd_requests/index.js';

const method = 'deleteMacaroonId';
const notSupported = /unknown/;
const type = 'default';

/** Revoke an access token given out in the past

  Note: this method is not supported in LND versions 0.11.0 and below

  Requires `macaroon:write` permission

  {
    id: <Access Token Macaroon Root Id Positive Integer String>
    lnd: <Authenticated LND API Object>
  }

  @returns via cbk or Promise
*/
export default ({id, lnd}, cbk) => {
  return new Promise((resolve, reject) => {
    asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!id) {
          return cbk([400, 'ExpectedPositiveMacaroonRootIdToRevoke']);
        }

        if (!isLnd({lnd, method, type})) {
          return cbk([400, 'ExpectedAuthenticatedLndApiObjectToRevokeAccess']);
        }

        return cbk();
      },

      // Revoke access
      revoke: ['validate', ({}, cbk) => {
        return lnd[type][method]({root_key_id: id}, (err, res) => {
          if (err && notSupported.test(err.details)) {
            return cbk([501, 'RevokeAccessMethodNotSupported']);
          }

          if (err) {
            return cbk([503, 'UnexpectedErrorFromRevokeMacaroon', {err}]);
          }

          if (!res) {
            return cbk([503, 'ExpectedResponseFromRevokeMacaroonRequest']);
          }

          if (res.deleted !== true) {
            return cbk([503, 'ExpectedDeletionConfirmationForRevokeMacaroon']);
          }

          return cbk();
        });
      }],
    },
    returnResult({reject, resolve}, cbk));
  });
};
