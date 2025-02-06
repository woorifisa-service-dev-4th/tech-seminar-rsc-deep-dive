export function processBinaryChunk(
  response: Response, // 처리 중인 응답 객체
  chunk: Uint8Array, // 처리할 바이너리 데이터
): void {
  // 여러 변수 상태 초기화
  let i = 0;
  let rowState = response._rowState;
  let rowID = response._rowID;
  let rowTag = response._rowTag;
  let rowLength = response._rowLength;
  const buffer = response._buffer;
  const chunkLength = chunk.length;
  while (i < chunkLength) { // 청크의 각 바이트를 순회하며 처리
    let lastIdx = -1;
    switch (rowState) {
      // rowState 처리 로직(생략)
    const offset = chunk.byteOffset + i;
    if (lastIdx > -1) {
      // 완성된 행 처리
      const length = lastIdx - i;
      const lastChunk = new Uint8Array(chunk.buffer, offset, length);
      processFullBinaryRow(response, rowID, rowTag, buffer, lastChunk);
      i = lastIdx;
      if (rowState === ROW_CHUNK_BY_NEWLINE) {
        i++;
      }
      rowState = ROW_ID;
      rowTag = 0;
      rowID = 0;
      rowLength = 0;
      buffer.length = 0;
    } else {
      // 다음 청크와 함께 처리 할 수 있도록 미완성 행을 버퍼에 저장
      const length = chunk.byteLength - i;
      const remainingSlice = new Uint8Array(chunk.buffer, offset, length);
      buffer.push(remainingSlice);
      rowLength -= remainingSlice.byteLength;
      break;
    }
  }
  // 모든 처리가 끝난 후 응답 객체의 상태 업데이트
  response._rowState = rowState;
  response._rowID = rowID;
  response._rowTag = rowTag;
  response._rowLength = rowLength;
}