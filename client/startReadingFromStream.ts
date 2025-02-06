function startReadingFromStream(
  response: FlightResponse, // 처리된 데이터를 저장하는 곳
  stream: ReadableStream, // 서버로부터 받은 데이터 스트림
): void {
  const reader = stream.getReader(); // 스트림에서 데이터를 읽기 위한 리더 객체 생성
  function progress({
    done, // 스트림을 다 읽었는지 체크하는 변수
    value, // 스트림에서 읽은 데이터 청크
  }: {
    done: boolean,
    value: ?any,
    ...
  }): void | Promise<void> {
    if (done) { // 스트림 읽기가 끝났다면
      close(response); // 함수 종료
      return;
    }
    const buffer: Uint8Array = (value: any);
    processBinaryChunk(response, buffer); // 데이터 청크 처리
    // 다음 청크가 준비되면 progress 함수 호출
    return reader.read().then(progress).catch(error); 
  }
  function error(e: any) {
    // 스트림 읽기 중 발생한 오류 처리
    reportGlobalError(response, e);
  }
  // 스트림 읽기 시작, 그 결과를 progress 함수로 전달
  reader.read().then(progress).catch(error);
}