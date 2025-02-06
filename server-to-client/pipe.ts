// pipe 메서드는 서버 사이드 렌더링 결과를 클라이언트로 스트리밍하는 역할을 합니다.
function pipe<T: Writable>(destination: T): T {
    if (hasStartedFlowing) {
        // 하나의 writable 스트림에만 파이핑할 수 있도록 체크
        throw new Error(
            'React currently only supports piping to one writable stream.',
        );
    }

    hasStartedFlowing = true;
    startFlowing(request, destination); // 데이터 흐름 시작

    // 스트림 버퍼가 비워졌을 때 추가 데이터를 쓸 수 있도록 핸들러 등록
    destination.on('drain', createDrainHandler(destination, request));

    // 스트림에서 오류가 발생했을 때 요청을 취소하는 핸들러 등록
    destination.on(
        'error',
        createCancelHandler(
            request,
            'The destination stream errored while writing data.',
        ),
    );

    // 스트림이 조기 종료되었을 경우 요청을 취소하는 핸들러 등록
    destination.on(
        'close',
        createCancelHandler(request, 'The destination stream closed early.'),
    );

    return destination; // 최종적으로 writable 스트림 반환
}
