import asyncAuto from 'async/auto.js';
import { returnResult } from 'asyncjs-util';

import { isLnd } from './../../lnd_requests/index.js';

const bufferFromHex = hex => Buffer.from(hex, 'hex');
const isHex = n => !(n.length % 2) && /^[0-9A-F]*$/i.test(n);

/** Cancel an invoice

  This call can cancel both HODL invoices and also void regular invoices

  Requires LND built with `invoicesrpc`

  Requires `invoices:write` permission

  {
    id: <Payment Preimage Hash Hex String>
    lnd: <Authenticated RPC LND API Object>
  }

  @returns via cbk or Promise
*/
export default ({id, lnd}, cbk) => {
  return new Promise((resolve, reject) => {
    asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!id || !isHex(id)) {
          return cbk([400, 'ExpectedIdOfInvoiceToCancel']);
        }

        if (!isLnd({lnd, method: 'cancelInvoice', type: 'invoices'})) {
          return cbk([400, 'ExpectedInvoicesLndGrpcApiToCancelHodlInvoice']);
        }

        return cbk();
      },

      // Cancel invoice
      cancel: ['validate', ({}, cbk) => {
        const paymentHash = bufferFromHex(id);

        return lnd.invoices.cancelInvoice({payment_hash: paymentHash}, err => {
          if (err) {
            return cbk([503, 'UnexpectedErrorCancelingHodlInvoice', {err}]);
          }

          return cbk();
        });
      }],
    },
    returnResult({reject, resolve}, cbk));
  });
};
