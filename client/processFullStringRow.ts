function processFullStringRow(
  response: Response, // 처리 중인 응답 객체
  id: number, // 행의 ID
  tag: number, // 행의 타입을 나타내는 태그(ASCII 코드로 표현)
  row: string, // 처리할 문자열 데이터
): void {
  switch (tag) {
    case 73 /* "I" */: {
      // 모듈
      resolveModule(response, id, row);
      return;
    }
    case 72 /* "H" */: {
      // 힌트
      const code: HintCode = (row[0]: any);
      resolveHint(response, code, row.slice(1));
      return;
    }
    case 84 /* "T" */: {
      // 텍스트
      resolveText(response, id, row);
      return;
    }
    // 에러, 디버그 정보, 개발/프로덕션 버전 불일치, 스트림 관련, Postpone 등을 처리하는 로직(생략)
    default: /* """ "{" "[" "t" "f" "n" "0" - "9" */ {
      // JSON 데이터 처리
      resolveModel(response, id, row);
      return;
    }
  }
}