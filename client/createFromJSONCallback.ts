function createFromFetch<T>(
  promiseForResponse: Promise<Response>, // 서버로부터의 응답을 포함하는 Promise 객체
  options?: Options, // 선택적인 옵션을 포함하는 객체
): Thenable<T> {
  // FlightResponse 객체 생성 (서버 응답을 처리하고 데이터를 저장할 객체)
  const response: FlightResponse = createResponseFromOptions(options);

  // 서버 응답을 처리하는 Promise
  promiseForResponse.then(
    function (r) {
      // 서버 응답 본문을 읽고 처리 (r.body는 ReadableStream 형태로 제공됨)
      // 서버에서 전송된 컴포넌트 트리 데이터를 파싱하여 FlightResponse 객체에 저장
      startReadingFromStream(response, (r.body: any));
    },
    function (e) {
      // 네트워크 오류 또는 서버 오류 발생 시 전역 오류 처리
      reportGlobalError(response, e);
    },
  );

  // 최종적으로 루트 컴포넌트를 반환 (비동기적으로 데이터가 로드되면 이를 해결)
  return getRoot(response);
}

// JSON 응답을 변환하는 콜백 함수 생성
function createFromJSONCallback(response: Response) {
  return function (key: string, value: JSONValue) {
    if (typeof value === 'string') {
      // 문자열 값을 특정 형식으로 파싱
      return parseModelString(response, this, key, value);
    }
    if (typeof value === 'object' && value !== null) {
      // 객체 값을 튜플 형식으로 파싱
      return parseModelTuple(response, value);
    }
    return value;
  };
}

// 특정 문자열 값을 분석하여 적절한 객체로 변환
function parseModelString(
  response: Response,
  parentObject: Object,
  key: string,
  value: string,
): any {
  if (value[0] === '$') {
    if (value === '$') {
      // 리액트 요소 처리
      if (initializingHandler !== null && key === '0') {
        initializingHandler = {
          parent: initializingHandler,
          chunk: null,
          value: null,
          deps: 0,
          errored: false,
        };
      }
      return REACT_ELEMENT_TYPE;
    }
    switch (value[1]) {
      case '$': {
        // 이스케이프된 문자열 처리
        return value.slice(1);
      }
      case 'L': {
        // 지연 로딩된 요소 처리
        const id = parseInt(value.slice(2), 16);
        const chunk = getChunk(response, id);
        return createLazyChunkWrapper(chunk);
      }
      case '@': {
        // Promise 처리
        if (value.length === 2) {
          return new Promise(() => {});
        }
        const id = parseInt(value.slice(2), 16);
        const chunk = getChunk(response, id);
        return chunk;
      }
      case 'S': {
        // Symbol 변환
        return Symbol.for(value.slice(2));
      }
      case 'F': {
        // 서버 참조 처리
        const ref = value.slice(2);
        return getOutlinedModel(
          response,
          ref,
          parentObject,
          key,
          createServerReferenceProxy,
        );
      }
      case 'T': {
        // 임시 참조 처리
        const reference = '$' + value.slice(2);
        const temporaryReferences = response._tempRefs;
        if (temporaryReferences == null) {
          throw new Error(
            'Missing a temporary reference set but the RSC response returned a temporary reference. ' +
              'Pass a temporaryReference option with the set that was used with the reply.',
          );
        }
        return readTemporaryReference(temporaryReferences, reference);
      }
      case 'Q': {
        // Map 변환 처리
        const ref = value.slice(2);
        return getOutlinedModel(response, ref, parentObject, key, createMap);
      }
      case 'W': {
        // Set 변환 처리
        const ref = value.slice(2);
        return getOutlinedModel(response, ref, parentObject, key, createSet);
      }
      case 'B': {
        // Blob 변환 처리
        if (enableBinaryFlight) {
          const ref = value.slice(2);
          return getOutlinedModel(response, ref, parentObject, key, createBlob);
        }
        return undefined;
      }
      case 'K': {
        // FormData 변환 처리
        const ref = value.slice(2);
        return getOutlinedModel(
          response,
          ref,
          parentObject,
          key,
          createFormData,
        );
      }
      case 'i': {
        // Iterator 변환 처리
        const ref = value.slice(2);
        return getOutlinedModel(
          response,
          ref,
          parentObject,
          key,
          extractIterator,
        );
      }
      case 'I': {
        // Infinity 값 변환
        return Infinity;
      }
      case '-': {
        // 특수한 숫자 값 변환 ($-0 또는 $-Infinity)
        if (value === '$-0') {
          return -0;
        } else {
          return -Infinity;
        }
      }
      case 'N': {
        // NaN 변환 처리
        return NaN;
      }
      case 'u': {
        // undefined 변환 처리
        return undefined;
      }
      case 'D': {
        // Date 변환 처리
        return new Date(Date.parse(value.slice(2)));
      }
      case 'n': {
        // BigInt 변환 처리
        return BigInt(value.slice(2));
      }
      default: {
        // 일반적인 데이터 모델 변환 처리
        const ref = value.slice(1);
        return getOutlinedModel(response, ref, parentObject, key, createModel);
      }
    }
  }
  return value;
}
