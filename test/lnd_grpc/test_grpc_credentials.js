import { equal, throws } from 'node:assert/strict';
import test from 'node:test';
import grpcCredentials from '../../lnd_grpc/grpc_credentials.js';

const tests = [
  {
    args: {macaroon: '00'},
    description: 'gRPC credentials are returned',
    expected: {},
  },
];

for (const { args, error, description } of tests) {
  test(description, (t, end) => {
    if (error) {
      throws(() => grpcCredentials(args), new Error(error), 'Got error');
    } else {
      equal(!!grpcCredentials(args).credentials, true, 'Got credentials');
    }

    return end();
  });
}
