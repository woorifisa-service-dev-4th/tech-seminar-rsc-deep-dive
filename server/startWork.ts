export const supportsRequestStorage = false;
export const requestStorage: AsyncLocalStorage<Request | void> = (null: any);
export function startWork(request: Request): void {
    // 렌더링 결과를 클라이언트로 보낼 준비가 되었는지 설정
    request.flushScheduled = request.destination !== null;
    if (supportsRequestStorage) {
        // 요청별 컨텍스트를 유지하면서 작업을 수행할 수 있게 한다.
        scheduleWork(() => requestStorage.run(request, performWork, request));
    } else {
        // performWork 함수를 호출하여 작업 수행
        scheduleWork(() => performWork(request));
    }
}

export function scheduleWork(callback: () => void) {
    setImmediate(callback);
}