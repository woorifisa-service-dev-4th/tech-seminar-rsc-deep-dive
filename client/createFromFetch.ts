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
