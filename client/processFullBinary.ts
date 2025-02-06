function processFullBinaryRow(
  response: Response,
  id: number,
  tag: number,
  buffer: Array<Uint8Array>,
  chunk: Uint8Array,
): void {
  if (enableBinaryFlight) {
    switch (tag) {
     // ArrayBuffer, Int8Array 등등 처리(생략)
  }

   // 문자열 데이터를 디코딩하여 처리
   const stringDecoder = response._stringDecoder;
   let row = '';
   for (let i = 0; i < buffer.length; i++) {
     row += readPartialStringChunk(stringDecoder, buffer[i]); // 중간 문자열 조각 디코딩
   }
   row += readFinalStringChunk(stringDecoder, chunk); // 마지막 문자열 조각 디코딩
   processFullStringRow(response, id, tag, row); // 디코딩된 문자열을 처리
 }
}
