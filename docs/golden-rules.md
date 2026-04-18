# Golden Rules

## GR-1: 토큰 격리
API 토큰(VERCEL_TOKEN, WEBHOOK_SECRET)은 서버리스 런타임(process.env)에서만 접근한다. 클라이언트 코드, 프론트매터, 커밋 메시지에 절대 포함 금지.

## GR-2: Vercel API v2 사용
배포 조회는 v2 엔드포인트(`/v2/now/deployments`)를 사용한다. v13은 빈 결과를 반환하는 이슈가 있다. 프로젝트 목록은 v9(`/v9/projects`) 사용.

## GR-3: packageinfo.md가 진실 공급원
프로젝트 메타데이터는 packageinfo.md의 YAML 프론트매터가 최우선이다. README 요약은 packageinfo.md가 없을 때만 fallback으로 사용한다.

## GR-4: 빈 화면 금지
로딩, 에러, 데이터 없음 모든 상태에 적절한 UI를 표시한다. 에러 시 재시도 버튼 필수.

## GR-5: 파일 크기 제한
- 컴포넌트: 300줄 이하
- API 핸들러: 150줄 이하
- 현재 위반: `api/projects.js` 200줄 (분리 필요)

## GR-6: 날짜 정규화
Vercel v2 API는 `created` 필드를 밀리초 타임스탬프(숫자)로 반환한다. 모든 날짜는 `normalizeDate()`로 ISO 문자열로 변환 후 사용한다.

## GR-7: 단방향 데이터 흐름
App.jsx → ProjectCard / ProjectSummary. 형제 컴포넌트 간 직접 통신 금지. 상태는 부모에서 관리한다.

## GR-8: 에러 소리 죽이지 않음
catch 블록에서 빈 처리 금지. 최소한 콘솔 로그 또는 사용자에게 에러 상태 표시. API 라우트에서는 적절한 HTTP 상태 코드 반환.

## GR-9: 캐시 헤더 명시
모든 API 응답에 `Cache-Control` 헤더를 설정한다. 프로젝트 목록은 30초, 배포 기록은 15초.

## GR-10: 문서 동기화
코드 변경(새 컴포넌트, API 변경, 설정 추가) 시 AGENTS.md, ARCHITECTURE.md를 즉시 업데이트한다.
