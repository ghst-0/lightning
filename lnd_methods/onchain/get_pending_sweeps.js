import asyncAuto from 'async/auto.js';
import { returnResult } from 'asyncjs-util';

import { isLnd } from '../../lnd_requests/index.js';
import { rpcSweepAsSweep } from '../../lnd_responses/index.js';

const {isArray} = Array;
const method = 'pendingSweeps';
const type = 'wallet';

/** Get pending self-transfer spends

  Requires `onchain:read` permission

  Requires LND built with `walletrpc` build tag

  This method is not supported in LND 0.17.5 or below

  {
    lnd: <Authenticated LND API Object>
  }

  @returns via cbk or Promise
  {
    sweeps: [{
      broadcasts_count: <Total Sweep Broadcast Attempts Count Number>
      [current_fee_rate]: <Current Chain Fee Rate Tokens Per VByte Number>
      [initial_fee_rate]: <Requested Chain Fee Rate Tokens per VByte Number>
      is_batching: <Requested Waiting For Batching Bool>
      [max_fee]: <Maximum Total Fee Tokens Allowed Number>
      [max_height]: <Targeted Maximum Confirmation Height Number>
      tokens: <Sweep Outpoint Tokens Value Number>
      transaction_id: <Sweeping Outpoint Transaction Id Hex String>
      transaction_vout: <Sweeping Outpoint Transaction Output Index Number>
      type: <Outpoint Constraint Script Type String>
    }]
  }
*/
export default ({lnd}, cbk) => {
  return new Promise((resolve, reject) => {
    asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!isLnd({lnd, method, type})) {
          return cbk([400, 'ExpectedLndToGetPendingSweeps']);
        }

        return cbk();
      },

      // Get sweep transaction ids
      getSweeps: ['validate', ({}, cbk) => {
        return lnd[type][method]({}, (err, res) => {
          if (err) {
            return cbk([503, 'UnexpectedGetPendingSweepsError', {err}]);
          }

          if (!res) {
            return cbk([503, 'ExpectedResponseToGetPendingSweepsRequest']);
          }

          if (!isArray(res.pending_sweeps)) {
            return cbk([503, 'ExpectedArrayOfPendingSweepsInSweepsResponse']);
          }

          try {
            const sweeps = res.pending_sweeps.map(rpcSweepAsSweep);

            return cbk(null, {sweeps});
          } catch (err) {
            return cbk([503, err.message]);
          }
        });
      }],
    },
    returnResult({reject, resolve, of: 'getSweeps'}, cbk));
  });
};
