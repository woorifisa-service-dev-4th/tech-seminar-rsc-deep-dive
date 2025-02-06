
function createTask(
    request: Request, // 현재 요청 객체
    model: ReactClientValue, // 렌더링할 React 요소 또는 데이터 모델
    keyPath: null | string, // 키 경로 (객체의 위치를 나타냄)
    implicitSlot: boolean, // 암시적 슬롯 여부
    abortSet: Set<Task>, // 중단 가능한 작업 집합
): Task {
    request.pendingChunks++; // 처리할 청크 개수 증가
    const id = request.nextChunkId++; // 청크에 대한 고유 ID 증가

    if (typeof model === "object" && model !== null) {
        if (keyPath !== null || implicitSlot) {
            // 특별한 처리가 필요할 경우 추가적인 작업 가능
        } else {
            // 순환 참조 방지 및 중복 직렬화를 막기 위해 객체를 추적
            request.writtenObjects.set(model, serializeByValueID(id));
        }
    }

    const task: Task = {
        id,
        status: PENDING, // 작업이 대기 중인 상태
        model,
        keyPath,
        implicitSlot,
        ping: () => pingTask(request, task), // 작업을 다시 시도하는 함수
        toJSON: function (parent, parentPropertyName, value) {
            return renderModel(request, task, parent, parentPropertyName, value);
        },
        thenableState: null, // 비동기 상태 (Promise 처리 등)
    };

    abortSet.add(task); // 작업을 중단 가능한 작업 목록에 추가
    return task; // 생성된 작업 반환
}
