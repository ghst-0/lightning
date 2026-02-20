import grpc_services from './grpc_services.json' with { type: 'json' };
import emitSubscriptionError from './emit_subscription_error.js';
import handleRemoveListener from './handle_remove_listener.js';

const {
  defaultSocket,
  grpcSslCipherSuites,
  maxReceiveMessageLength,
  packageTypes,
  protoFiles,
  protosDir,
  serviceTypes,
  unauthenticatedPackageTypes,
  unauthenticatedServiceTypes
} = grpc_services;

export {
  defaultSocket,
  emitSubscriptionError,
  grpcSslCipherSuites,
  handleRemoveListener,
  maxReceiveMessageLength,
  packageTypes,
  protoFiles,
  protosDir,
  serviceTypes,
  unauthenticatedPackageTypes,
  unauthenticatedServiceTypes,
};
