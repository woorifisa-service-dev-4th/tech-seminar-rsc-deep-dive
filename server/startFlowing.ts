export function startFlowing(request: Request, destination: Destination): void {
    if (request.status === CLOSING) {
        // 요청이 CLOSING(종료 예정) 상태인 경우, 요청을 CLOSED 상태로 변경하고 오류 처리
        request.status = CLOSED;
        closeWithError(destination, request.fatalError);
        return;
    }

    if (request.status === CLOSED) {
        // 요청이 이미 CLOSED(완전히 종료)된 상태이면 아무 작업도 수행하지 않음
        return;
    }

    if (request.destination !== null) {
        // 목적지가 이미 설정된 경우(데이터 흐름이 시작된 상태), 중복 실행 방지
        return;
    }

    request.destination = destination; // 스트림 목적지 설정
    try {
        flushCompletedChunks(request, destination); // 완료된 청크 데이터를 스트림으로 전송
    } catch (error) {
        // 오류 발생 시 복구 가능한 오류로 로깅하고 치명적 오류로 처리
        logRecoverableError(request, error, null);
        fatalError(request, error);
    }
}