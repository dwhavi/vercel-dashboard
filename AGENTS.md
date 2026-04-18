# Vercel Dashboard — AGENTS.md

## 개요
Vercel 프로젝트 배포 현황을 한눈에 모니터링하는 대시보드. Vercel API로 프로젝트/배포 정보를 조회하고, GitHub에서 packageinfo.md를 읽어 프로젝트 메타데이터를 표시한다.

## 기술 스택
- React 19 + Vite 8 + Tailwind CSS v4
- Vercel Serverless Functions (api/)
- gray-matter (YAML 파싱), react-markdown

## 아키텍처
SPA + 서버리스 API. 클라이언트는 `/api/projects`로 폴링(30초), 서버에서 Vercel/GitHub API를 호출하여 응집된 데이터 반환. 상세는 → docs/ARCHITECTURE.md

## 핵심 규칙
1. API 토큰은 서버리스 런타임(process.env)에서만 접근. 클라이언트에 절대 노출 금지
2. Vercel API는 v2 엔드포인트 사용. v13은 빈 결과 반환 이슈 있음
3. packageinfo.md가 진실 공급원. README 요약은 fallback
4. 실패 시 빈 화면 금지. 에러 메시지 + 재시도 버튼 표시
5. 컴포넌트 300줄, API 150줄 이하 유지
전체 규칙 → docs/golden-rules.md

## 문서 색인
| 문서 | 내용 |
|------|------|
| packageinfo.md | 프로젝트 메타/배포 정보 (YAML 프론트매터) |
| README.md | 프로젝트 개요, 빠른 시작 |
| docs/ARCHITECTURE.md | 아키텍터, API, 데이터 흐름 상세 |
| docs/golden-rules.md | 황금 원칙 전체 |
| docs/decisions.md | 의사결정 기록 |

## 프로젝트 구조
```
src/
  components/
    ProjectCard.jsx      # 프로젝트 카드 (배포 상태, 메타, URL)
    ProjectSummary.jsx   # 상세 모달 (packageinfo.md 렌더, 배포 히스토리)
    StatusBadge.jsx      # 배포/서비스 상태 배지
    DeploymentList.jsx   # 배포 기록 모달 (미사용, 제거 예정)
api/
  projects.js           # GET /api/projects — 프로젝트 목록 + GitHub 메타
  webhook.js            # POST /api/webhook — 배포 이벤트 수신
  deployments/[id].js   # GET /api/deployments/:id — 배포 기록
```

## 작업 규칙
- 결정은 docs/decisions.md에 기록 (D-N 형식)
- 큰 작업은 docs/plans/에 계획 생성
- 코드 변경 시 관련 문서 즉시 업데이트

## 배포
```bash
source .env && vercel --prod --token="$VERCEL_TOKEN"
```
환경변수(VERCEL_TOKEN, WEBHOOK_SECRET)는 Vercel 프로젝트 설정에 REST API로 등록. .env는 gitignore.

## 알려진 이슈
- DeploymentList.jsx에 `useState` 버그 (useEffect로 수정 필요, 현재 미사용 컴포넌트)
