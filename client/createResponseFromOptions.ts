function createResponseFromOptions(options: void | Options) {
  return createResponse(
    null,
    null,
    options && options.callServer ? options.callServer : undefined,
    undefined, // encodeFormAction
    undefined, // nonce
    options && options.temporaryReferences
      ? options.temporaryReferences
      : undefined,
    __DEV__ && options && options.findSourceMapURL
      ? options.findSourceMapURL
      : undefined,
    __DEV__ ? (options ? options.replayConsoleLogs !== false : true) : false,
  );
}

//createResponse 함수
export function createResponse(
  bundlerConfig: SSRModuleMap,
  moduleLoading: ModuleLoading,
  callServer: void | CallServerCallback,
  encodeFormAction: void | EncodeFormActionCallback,
  nonce: void | string,
  temporaryReferences: void | TemporaryReferenceSet,
  findSourceMapURL: void | FindSourceMapURLCallback,
  replayConsole: boolean,
): Response {
  return new ResponseInstance(
    bundlerConfig,
    moduleLoading,
    callServer,
    encodeFormAction,
    nonce,
    temporaryReferences,
    findSourceMapURL,
    replayConsole,
  );
}