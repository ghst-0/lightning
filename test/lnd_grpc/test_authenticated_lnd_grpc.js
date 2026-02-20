import { deepStrictEqual, equal } from 'node:assert/strict';
import { join } from 'node:path';
import test from 'node:test';
import { authenticatedLndGrpc } from '../../index.js';

const expectedServices = [
  'autopilot',
  'blocks',
  'chain',
  'default',
  'invoices',
  'peers',
  'router',
  'signer',
  'tower_client',
  'tower_server',
  'version',
  'wallet',
];

const tests = [
  {
    args: {macaroon: Buffer.alloc(1).toString('hex')},
    description: 'An authenticated LND gRPC Object is returned',
    expected: {services: expectedServices},
  },
  {
    args: {cert: '00', macaroon: Buffer.alloc(1).toString('hex')},
    description: 'Passing a cert for the authenticated LND grpc is supported',
    expected: {services: expectedServices},
  },
  {
    args: {path: join(import.meta.dirname, '../../grpc/protos')},
    description: 'The path can be specified',
    expected: {services: expectedServices},
  },
];

for (const { args, description, expected } of tests) {
  test(description, (t, end) => {
    const {lnd} = authenticatedLndGrpc(args);

    equal(!!lnd, true, 'Got LND object');
    deepStrictEqual(Object.keys(lnd), expected.services, 'Got services');

    return end();
  });
}
