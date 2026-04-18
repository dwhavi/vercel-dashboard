# Decisions

## D-1: Vercel v2 API 사용
**결정:** 배포 조회에 `/v2/now/deployments` 사용
**대안:** `/v13/deployments` (최신 버전)
**이유:** v13은 빈 결과를 반환하는 재현 가능한 이슈가 있음. v2는 안정적으로 동작하며 `pagination.count` 포함. `created` 필드가 밀리초 숫자로 반환되므로 `normalizeDate()`로 변환 필요.
**날짜:** 2025-01 (초기 개발 시)

## D-2: packageinfo.md 컨벤션
**결정:** 모니터링 대상 프로젝트 루트에 `packageinfo.md` 배치, YAML 프론트매터로 메타 정의
**대안:** README만 사용, package.json에 메타 추가, 별도 설정 파일
**이유:** 마크다운 본문까지 대시보드에서 렌더링 가능. YAML 프론트매터는 gray-matter로 파싱 간단. 대시보드 자체도 packageinfo.md를 사용하므로 일관성 유지.
**날짜:** 2025-01

## D-3: GitHub Raw API (인증 없이)
**결정:** `application/vnd.github.v3.raw` Accept 헤더로 packageinfo.md/README 조회
**대안:** GitHub App 설치, Personal Access Token 사용, GraphQL API
**이유:** 공개 저장소만 대상이라면 인증 불필요. 비율 제한은 IP당 60회/시간이지만 프로젝트 수가 적어 문제 없음. 토큰 관리 오버헤드 회피.
**날짜:** 2025-01

## D-4: 30초 폴링
**결정:** 클라이언트에서 30초 간격으로 `/api/projects` 폴링
**대안:** WebSocket, SSE (Server-Sent Events), Vercel Edge Config
**이유:** 단순한 상태 조회에 충분. WebSocket은 Vercel 서버리스와 호환성 문제. 30초는 사용자 경험과 API 부하의 균형점. 수동 새로고침도 지원.
**날짜:** 2025-01

## D-5: Webhook 로깅만 (DB 없이)
**결정:** webhook.js에서 이벤트 수신 후 로깅만 하고, 실시간 업데이트는 클라이언트 폴링에 의존
**대안:** Vercel KV/Redis에 이벤트 저장, 클라이언트에 push
**이유:** 추가 인프라 없이 단순 유지. 폴링 간격(30s) 내에 대시보드 갱신되므로 실시간성 요구 낮음. 향후 필요시 KV 추가 가능.
**날짜:** 2025-01

## D-6: deployType 3중 분기
**결정:** `vercel` | `local` | `both` 세 가지 배포 유형 지원
**대안:** 항상 Vercel URL만 표시
**이유:** 일부 프로젝트는 Vercel이 아닌 곳에 서비스되거나, Vercel과 별도 서비스 URL을 모두 표시해야 함. packageinfo.md의 `deployType`과 `serviceUrl` 필드로 유연하게 제어.
**날짜:** 2025-02

## D-7: README 요약 fallback
**결정:** packageinfo.md가 없으면 GitHub README에서 첫 문장 추출
**대안:** 항상 packageinfo.md 필수, 빈 값 표시
**이유:** 모든 프로젝트에 packageinfo.md가 있는 것은 아님. README 첫 문장이 최소한의 프로젝트 설명으로 충분. 마크다운 문법 제거 후 100자 제한.
**날짜:** 2025-01

## D-8: HIDDEN_PROJECTS 환경변수
**결정:** 쉼표로 구분된 프로젝트 이름으로 특정 프로젝트 숨김
**대안:** 대시보드 UI에서 숨김, 별도 설정 파일, GitHub 토픽으로 필터
**이유:** 배포는 하되 대시보드에서 숨기고 싶은 프로젝트가 있음. 환경변수면 코드 변경 없이 즉시 반영 가능.
**날짜:** 2025-03
