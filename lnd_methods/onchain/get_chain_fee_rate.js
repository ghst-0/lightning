import asyncAuto from 'async/auto.js';
import { returnResult } from 'asyncjs-util';
import { isLnd } from '../../lnd_requests/index.js';

const defaultConfirmationTarget = 6;
const method = 'estimateFee';
const type = 'wallet';
const weightPerKWeight = 1e3;
const weightPerVByte = 4;

/** Get chain fee rate estimate

  Requires LND built with `walletrpc` tag

  Requires `onchain:read` permission

  {
    [confirmation_target]: <Future Blocks Confirmation Number>
    lnd: <Authenticated LND API Object>
  }

  @returns via cbk or Promise
  {
    tokens_per_vbyte: <Tokens Per Virtual Byte Number>
  }
*/
export default (args, cbk) => {
  return new Promise((resolve, reject) => {
    asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!isLnd({method, type, lnd: args.lnd})) {
          return cbk([400, 'ExpectedAuthenticatedLndToGetFeeEstimate']);
        }

        return cbk();
      },

      // Get fee rate
      getRate: ['validate', ({}, cbk) => {
        const conf = args.confirmation_target || defaultConfirmationTarget;

        return args.lnd[type][method]({conf_target: conf}, (err, res) => {
          if (err) {
            return cbk([503, 'UnexpectedErrorGettingFeeFromLnd', {err}]);
          }

          if (!res) {
            return cbk([503, 'ExpectedResponseForEstimateFeeRequest']);
          }

          if (!res.sat_per_kw) {
            return cbk([503, 'ExpectedSatPerKwResponseForFeeEstimate']);
          }

          const satsPerKw = Number(res.sat_per_kw);

          const tokensPerVByte = satsPerKw * weightPerVByte / weightPerKWeight;

          return cbk(null, {tokens_per_vbyte: tokensPerVByte});
        });
      }],
    },
    returnResult({reject, resolve, of: 'getRate'}, cbk));
  });
};
