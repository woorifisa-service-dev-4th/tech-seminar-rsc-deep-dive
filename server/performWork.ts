// 서버에서 클라이언트로 전송할 작업을 처리하는 함수
function performWork(request: Request): void {
    // React 내부 상태를 현재 요청에 맞게 설정, Hooks 디스패처를 설정, 현재 요청 정보 저장
    // Hooks 사용을 위한 준비
    const prevDispatcher = ReactSharedInternals.H;
    ReactSharedInternals.H = HooksDispatcher;
    const prevRequest = currentRequest;
    currentRequest = request;
    prepareToUseHooksForRequest(request);

    try {
        const pingedTasks = request.pingedTasks; // 처리해야 할 작업 목록
        request.pingedTasks = []; // 처리할 작업 목록 초기화
        for (let i = 0; i < pingedTasks.length; i++) {
            const task = pingedTasks[i];
            retryTask(request, task); // 각 작업을 다시 시도
        }
        if (request.destination !== null) {
            // 목적지가 설정되어 있다면 클라이언트로 전송
            flushCompletedChunks(request, request.destination);
        }
    } catch (error) {
        // 발생한 오류 로깅, 심각한 오류로 처리
        logRecoverableError(request, error, null);
        fatalError(request, error);
    } finally {
        ReactSharedInternals.H = prevDispatcher; // React 내부 상태를 이전 상태로 복원
        resetHooksForRequest(); // Hooks 관련 설정 초기화
        currentRequest = prevRequest; // 현재 요청 정보를 이전 상태로 복원
    }
}