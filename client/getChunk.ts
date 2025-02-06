export function getRoot<T>(response: Response): Thenable<T> {
  const chunk = getChunk(response, 0); // 첫 번째 청크 가져오기
  return (chunk: any);
}

function getChunk(response: Response, id: number): SomeChunk<any> {
  const chunks = response._chunks; // 청크 맵 가져오기
  let chunk = chunks.get(id); // 청크 조회
  if (!chunk) {
    // 청크가 존재하지 않는 경우
    // 대기 중인 청크 생성, 추가
    chunk = createPendingChunk(response);
    chunks.set(id, chunk);
  }
  return chunk;
}


//createPendingChunk
function createPendingChunk<T>(response: Response): PendingChunk<T> {
  // 청크 생성(PENDING 상태, value, reson은 null로 설정)
  return new Chunk(PENDING, null, null, response);
}

// 상태, 값, 이유, 응답 객체를 속성을 가지는 객체를 생성하는 함수이다.
function Chunk(status: any, value: any, reason: any, response: Response) {
  this.status = status;
  this.value = value;
  this.reason = reason;
  this._response = response;
}

// prototype을 Promise 기반으로 설정하여 Promise와 유사하게 동작할 수 있게 설정
Chunk.prototype = (Object.create(Promise.prototype): any);
Chunk.prototype.then = function <T>(
  this: SomeChunk<T>,
  resolve: (value: T) => mixed,
  reject?: (reason: mixed) => mixed,
) {
  const chunk: SomeChunk<T> = this;
  switch (chunk.status) {
    // 청크 상태 처리
    case RESOLVED_MODEL:
      // 서버 컴포넌트의 렌더링 결과가 준비되었을 때
      initializeModelChunk(chunk);
      break;
    case RESOLVED_MODULE:
      // 클라이언트 컴포넌트에 대한 참조 정보가 준비되었을 때
      initializeModuleChunk(chunk);
      break;
  }
  switch (chunk.status) {
    case INITIALIZED:
      // 청크 데이터가 완전히 로드되고 초기화되었을 경우(위 상태 처리를 거친 경우)
      resolve(chunk.value);
      break;
    case PENDING: // 아직 데이터가 도착하지 않은 경우
    case BLOCKED: // 아직 완전히 로드되지 않은 경우
      // 나중에 청크가 해결되거나 거부될 때 콜백을 호출하기 위해 배열에 추가
      if (resolve) {
        if (chunk.value === null) {
          chunk.value = ([]: Array<(T) => mixed>);
        }
        chunk.value.push(resolve);
      }
      if (reject) {
        if (chunk.reason === null) {
          chunk.reason = ([]: Array<(mixed) => mixed>);
        }
        chunk.reason.push(reject);
      }
      break;
    default:
      // 오류 상태인 경우 reject 호출
      if (reject) {
        reject(chunk.reason);
      }
      break;
  }
};