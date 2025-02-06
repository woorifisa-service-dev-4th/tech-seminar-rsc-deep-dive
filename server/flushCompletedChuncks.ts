function flushCompletedChunks(
    request: Request,
    destination: Destination,
): void {
    beginWriting(destination); // 스트림 쓰기 작업 시작
    try {
        // 임포트 청크 처리(동적 임포트된 모듈을 클라이언트에 전달)
        const importsChunks = request.completedImportChunks;
        let i = 0;
        for (; i < importsChunks.length; i++) {
            request.pendingChunks--; // 대기 중인 청크 개수 감소
            const chunk = importsChunks[i];
            const keepWriting: boolean = writeChunkAndReturn(destination, chunk);
            if (!keepWriting) {
                // 스트림이 더 이상 쓰기를 허용하지 않는다면, 중단하고 목적지를 해제
                request.destination = null;
                i++;
                break;
            }
        }
        importsChunks.splice(0, i); // 처리된 청크 제거

        // 힌트 청크 처리(미리 로드할 수 있는 리소스)
        // 일반 청크 처리(주요 코드나 컴포넌트 등)
        // 오류 청크 처리(오류 정보나 폴백 컴포넌트 전송)
    } finally {
        request.flushScheduled = false; // 플러시 예약 상태 해제
        completeWriting(destination); // 쓰기 작업 완료
    }
    flushBuffered(destination); // 남은 데이터 버퍼를 비움

    if (request.pendingChunks === 0) {
        // 모든 청크가 처리되었으면 정리 작업 수행
        if (enableTaint) {
            cleanupTaintQueue(request); // 오염 데이터 정리
        }
        request.status = CLOSED; // 요청 상태를 CLOSED로 변경
        close(destination); // 스트림을 닫음
        request.destination = null; // 목적지 해제
    }
}
