function retryTask(request: Request, task: Task): void {
    if (task.status !== PENDING) {
        return; // PENDING 상태가 아니면 재시도할 필요 없음
    }
    task.status = RENDERING; // 작업 상태를 렌더링 중(RENDERING)으로 변경

    try {
        modelRoot = task.model;
        // 모델을 렌더링하고 결과를 저장
        const resolvedModel = renderModelDestructive(request, task, emptyRoot, "", task.model);
        modelRoot = resolvedModel;

        task.keyPath = null;
        task.implicitSlot = false;

        if (typeof resolvedModel === "object" && resolvedModel !== null) {
            // 렌더링 결과가 객체일 경우 writtenObjects에 저장 후 청크 생성
            request.writtenObjects.set(resolvedModel, serializeByValueID(task.id));
            emitChunk(request, task, resolvedModel);
        } else {
            // 객체가 아닌 경우 JSON 변환 후 모델 청크 생성
            const json: string = stringify(resolvedModel);
            emitModelChunk(request, task.id, json);
        }

        request.abortableTasks.delete(task); // 작업을 중단 가능 목록에서 제거
        task.status = COMPLETED; // 완료 상태로 변경
    } catch (thrownValue) {
        // 예외 발생 시 처리
        handleTaskError(request, task, thrownValue);
    }
}