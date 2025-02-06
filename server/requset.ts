export type Request = {
    status: 0 | 1 | 2 | 3, // 현재 요청 상태 (0: 초기화, 1: 진행 중, 2: 완료, 3: 중단)
    flushScheduled: boolean, // 데이터 전송이 예약되었는지 여부
    fatalError: mixed, // 치명적 오류 발생 시 저장되는 값
    destination: null | Destination, // 렌더링 결과를 전송할 대상 스트림 또는 연결 객체
    bundlerConfig: ClientManifest, // 클라이언트 측에서 필요한 번들 정보 및 설정
    cache: Map<Function, mixed>, // 함수 호출 결과를 캐싱하는 맵 객체 (중복 연산 방지)
    nextChunkId: number, // 다음 청크(chunk)에 할당될 고유한 ID
    pendingChunks: number, // 처리 대기 중인 청크의 개수
    hints: Hints, // 렌더링 최적화를 위한 힌트 정보
    abortListeners: Set<(reason: mixed) => void>, // 요청이 중단될 때 호출되는 리스너 집합
    abortableTasks: Set<Task>, // 중단 가능한 작업(예: 비동기 연산) 집합
    pingedTasks: Array<Task>, // 실행 가능한 상태가 된 작업 배열
    completedImportChunks: Array<Chunk>, // 완료된 import 청크 배열 (코드 분할 시 사용)
    completedHintChunks: Array<Chunk>, // 완료된 힌트 관련 청크 배열
    completedRegularChunks: Array<Chunk | BinaryChunk>, // 일반 렌더링 청크 (텍스트 또는 바이너리 데이터 포함)
    completedErrorChunks: Array<Chunk>, // 오류가 발생한 청크 배열
    writtenSymbols: Map<symbol, number>, // 전송된 심볼(Symbol) 매핑 테이블
    writtenClientReferences: Map<ClientReferenceKey, number>, // 클라이언트에서 참조된 요소들의 맵
    writtenServerReferences: Map<ServerReference<any>, number>, // 서버에서 참조된 요소들의 맵
    writtenObjects: WeakMap<Reference, string>, // 약한 참조(WeakMap)로 관리되는 객체 정보
    temporaryReferences: void | TemporaryReferenceSet, // 임시 참조 집합 (특정 연산 중 일시적으로 필요)
    identifierPrefix: string, // 고유 식별자 프리픽스 (ID 생성 시 사용)
    identifierCount: number, // 식별자 카운트 (고유 ID 관리)
    taintCleanupQueue: Array<string | bigint>, // 정리할 오염된 데이터 큐 (메모리 정리 관련)
    onError: (error: mixed) => string | null, // 오류 발생 시 실행되는 핸들러 함수
    onPostpone: (reason: string) => void, // 요청 연기 시 실행되는 콜백 함수

    // 개발(DEV) 환경에서만 사용되는 속성
    environmentName: () => string, // 실행 환경의 이름을 반환하는 함수
    didWarnForKey: null | WeakSet<ReactComponentInfo>, // 키 관련 경고 발생 여부를 추적하는 WeakSet
};


class Destination {
}

class ClientManifest {
}

class mixed {
}

class Hints {
}

class Task {
}

class Chunk {
}

class BinaryChunk {
}

class ClientReferenceKey {
}

class ServerReference<T> {
}

class Reference {
}

class TemporaryReferenceSet {
}

class ReactComponentInfo {
}
