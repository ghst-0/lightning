import { join } from 'node:path';
import grpc from '@grpc/grpc-js';
import { loadSync } from '@grpc/proto-loader';
import {
  defaultSocket,
  grpcSslCipherSuites,
  packageTypes,
  protoFiles,
  protosDir,
  unauthenticatedServiceTypes
} from './../grpc/index.js';
import grpcOptions from './grpc_options.js';
import grpcSsl from './grpc_ssl.js';

const {GRPC_SSL_CIPHER_SUITES} = process.env;
const {keys} = Object;
const pathToProto = file => join(__dirname, protosDir, file);

/** Unauthenticated gRPC interface to the Lightning Network Daemon (lnd).

  Make sure to provide a cert when using LND with its default self-signed cert

  {
    [cert]: <Base64 or Hex Serialized LND TLS Cert String>
    [path]: <Path to Proto Files Directory String>
    [socket]: <Host:Port String>
  }

  @throws
  <Error>

  @returns
  {
    lnd: {
      status: <Status LND API Object>
      unlocker: <Unlocker LND API Object>
    }
  }
*/
export default ({cert, path, socket}) => {
  const credentials = grpcSsl({cert}).ssl;
  const lndSocket = socket || defaultSocket;

  if (!!cert && GRPC_SSL_CIPHER_SUITES !== grpcSslCipherSuites) {
    process.env.GRPC_SSL_CIPHER_SUITES = grpcSslCipherSuites;
  }

  // Assemble different services from their proto files
  return {
    lnd: keys(unauthenticatedServiceTypes).reduce((services, type) => {
      const service = unauthenticatedServiceTypes[type];

      const file = protoFiles[service];

      const protoPath = path ? join(path, file) : pathToProto(file);

      const rpc = grpc.loadPackageDefinition(loadSync(protoPath, grpcOptions));

      services[type] = new rpc[packageTypes[service]][service](
        lndSocket,
        credentials
      );

      return services;
    },
    {}),
  };
};
