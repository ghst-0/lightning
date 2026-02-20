import { equal, deepStrictEqual } from 'node:assert/strict';
import { join } from 'node:path';
import test from 'node:test';
import { unauthenticatedLndGrpc } from '../../index.js';

const expectedServices = ['status', 'unlocker'];

const tests = [
  {
    args: {},
    description: 'An authenticated LND gRPC Object is returned',
    expected: {services: expectedServices},
  },
  {
    args: {cert: '00'},
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
    const {lnd} = unauthenticatedLndGrpc(args);

    equal(!!lnd, true, 'Got LND object');
    deepStrictEqual(Object.keys(lnd), expected.services, 'Got services');

    return end();
  });
}
