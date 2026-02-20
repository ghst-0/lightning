import asyncAuto from 'async/auto.js';
import { returnResult } from 'asyncjs-util';

import { isLnd } from '../../lnd_requests/index.js';

const {ceil} = Math;
const confidenceDenominator = 1e6;
const hexAsBuffer = hex => Buffer.from(hex, 'hex');
const method = 'queryProbability';
const type = 'router';
const unimplementedError = 'unknown service routerrpc.Router';

/** Get the confidence in being able to send between a direct pair of nodes

  Requires `offchain:read` permission

  {
    from: <From Public Key Hex String>
    lnd: <Authenticated LND API Object>
    mtokens: <Millitokens To Send String>
    to: <To Public Key Hex String>
  }

  @returns via cbk or Promise
  {
    confidence: <Success Confidence Score Out Of One Million Number>
  }
*/
export default ({from, lnd, mtokens, to}, cbk) => {
  return new Promise((resolve, reject) => {
    asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!from) {
          return cbk([400, 'ExpectedFromPublicKeyToGetRoutingConfidence']);
        }

        if (!isLnd({lnd, method, type})) {
          return cbk([400, 'ExpectedAuthenticatedLndToGetRoutingConfidence']);
        }

        if (!mtokens) {
          return cbk([400, 'ExpectedMillitokensToGetRoutingConfidence']);
        }

        if (!to) {
          return cbk([400, 'ExpectedToPublicKeyToGetRoutingConfidence']);
        }

        return cbk();
      },

      // Get probability of success
      getConfidence: ['validate', ({}, cbk) => {
        return lnd[type][method]({
          amt_msat: mtokens,
          from_node: hexAsBuffer(from),
          to_node: hexAsBuffer(to),
        },
        (err, res) => {
          if (err && err.details === unimplementedError) {
            return cbk([501, 'QueryProbabilityNotImplemented']);
          }

          if (err) {
            return cbk([503, 'UnexpectedErrorFromQueryProbability', {err}]);
          }

          if (!res) {
            return cbk([503, 'ExpectedResponseFromQueryProbability']);
          }

          if (!res.history) {
            return cbk([503, 'ExpectedHistoryFromQueryProbability']);
          }

          if (res.probability === undefined) {
            return cbk([503, 'ExpectedProbabilityInQueryProbabilityResult']);
          }

          return cbk(null, {
            confidence: ceil(res.probability * confidenceDenominator),
          });
        });
      }],
    },
    returnResult({reject, resolve, of: 'getConfidence'}, cbk));
  });
};
