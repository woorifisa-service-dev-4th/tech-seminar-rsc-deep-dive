// 서버에서 클라이언트로 스트리밍을 통해 렌더링 결과 전달
function renderToPipeableStream(
    model: ReactClientValue, // 서버 사이드 렌더링(SSR)할 React 컴포넌트 또는 데이터 모델
    moduleBasePath: ClientManifest, // 클라이언트 측에서 사용할 모듈 매니페스트 (번들 정보)
    options?: Options, // 옵션 객체 (에러 핸들러, 식별자 프리픽스 등 포함)
): PipeableStream {
    // 서버 렌더링 요청(request) 객체 생성
    const request = createRequest(
        model, // 렌더링할 React 컴포넌트
        moduleBasePath, // 클라이언트 매니페스트 정보 전달
        options ? options.onError : undefined, // 에러 발생 시 실행할 핸들러 (옵션)
        options ? options.identifierPrefix : undefined, // 식별자 프리픽스 (옵션)
        options ? options.onPostpone : undefined, // 연기 요청 시 실행할 콜백 함수 (옵션)
        options ? options.environmentName : undefined, // 실행 환경 식별자 (옵션)
        options ? options.temporaryReferences : undefined, // 임시 참조 객체 (옵션)
    );

    let hasStartedFlowing = false; // 스트리밍이 시작되었는지 여부를 추적하는 플래그

    startWork(request); // React 렌더링 시작 (비동기적으로 작업 수행)

    return {
        // 서버 사이드 렌더링 결과를 스트림으로 전달하는 메서드
        pipe<T: Writable>(destination: T): T {
        if (hasStartedFlowing) {
            throw new Error(
                'React currently only supports piping to one writable stream.',
            );
        }
        hasStartedFlowing = true; // 스트리밍 시작 상태로 변경

        startFlowing(request, destination); // React SSR 결과를 스트림으로 전달 시작

        // 스트림이 다 비워졌을 때 호출되는 핸들러 (추가 데이터 전송 가능)
        destination.on('drain', createDrainHandler(destination, request));

        // 스트림 쓰기 도중 에러 발생 시 렌더링 요청 중단
        destination.on(
            'error',
            createCancelHandler(
                request,
                'The destination stream errored while writing data.',
            ),
        );

        // 스트림이 예상보다 일찍 닫혔을 경우 렌더링 요청 중단
        destination.on(
            'close',
            createCancelHandler(request, 'The destination stream closed early.'),
        );

        return destination; // 원본 스트림 반환
    },

    // 서버 렌더링을 강제로 중단하고, 클라이언트에서 남은 부분을 렌더링하게 만드는 메서드
    abort(reason: mixed) {
        abort(request, reason); // 요청을 중단하고 리소스 정리
    },
};
}