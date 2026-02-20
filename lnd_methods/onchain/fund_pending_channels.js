import asyncAuto from 'async/auto.js';
import asyncEach from 'async/each.js';
import asyncEachSeries from 'async/eachSeries.js';
import { returnResult } from 'asyncjs-util';
import { isLnd } from '../../lnd_requests/index.js';

const bufferFromHex = hex => Buffer.from(hex, 'hex');
const {isArray} = Array;
const isHash = n => /^[0-9A-F]{64}$/i.test(n);
const isHex = n => !!n && !(n.length % 2) && /^[0-9A-F]*$/i.test(n);
const method = 'fundingStateStep';
const type = 'default';

/** Fund pending channels

  Requires `offchain:write`, `onchain:write` permissions

  {
    channels: [<Pending Channel Id Hex String>]
    funding: <Signed Funding Transaction PSBT Hex String>
    lnd: <Authenticated LND API Object>
  }

  @returns via cbk or Promise
*/
export default (args, cbk) => {
  return new Promise((resolve, reject) => {
    asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!isArray(args.channels)) {
          return cbk([400, 'ExpectedPendingChannelIdsToFundChannels']);
        }

        if (args.channels.length === 0) {
          return cbk([400, 'ExpectedPendingChannelIdsToFund']);
        }

        if (args.channels.some(n => !n)) {
          return cbk([400, 'ExpectedNonEmptyPendingChannelIdsToFund']);
        }

        if (args.channels.some(n => !isHash(n))) {
          return cbk([400, 'ExpectedPendingChannelIdOfChannelToFund']);
        }

        if (!isHex(args.funding)) {
          return cbk([400, 'ExpectedFundingPsbtToFundChannel']);
        }

        if (!isLnd({method, type, lnd: args.lnd})) {
          return cbk([400, 'ExpectedAuthenticatedLndToFundChannels']);
        }

        return cbk();
      },

      // Funded and signed PSBT
      psbt: ['validate', ({}, cbk) => cbk(null, bufferFromHex(args.funding))],

      // Verify the funding for each pending channel
      verify: ['psbt', 'validate', ({psbt}, cbk) => {
        return asyncEach(args.channels, (id, cbk) => {
          return args.lnd[type][method]({
            psbt_verify: {
              funded_psbt: psbt,
              pending_chan_id: bufferFromHex(id),
            },
          },
          err => {
            if (err) {
              return cbk([503, 'UnexpectedErrorValidatingChanFunding', {err}]);
            }

            return cbk();
          });
        },
        cbk);
      }],

      // Finalize the psbts
      finalize: ['psbt', 'verify', ({psbt}, cbk) => {
        const [lastChannel] = args.channels.slice().reverse();

        return asyncEachSeries(args.channels, (id, cbk) => {
          return args.lnd[type][method]({
            psbt_finalize: {
              no_publish: id !== lastChannel,
              pending_chan_id: bufferFromHex(id),
              signed_psbt: psbt,
            },
          },
          err => {
            if (err) {
              return cbk([503, 'UnexpectedErrorFinalizingChanFunding', {err}]);
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
