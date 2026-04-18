# Architecture

## 시스템 구조

```
┌─────────────┐     30s polling     ┌──────────────────┐
│   Browser   │ ──────────────────→ │  /api/projects   │
│  (React)    │ ←────────────────── │  /api/deployments│
└─────────────┘                     │  /api/webhook    │
                                    └────────┬─────────┘
                                             │
                              ┌──────────────┼──────────────┐
                              ▼              ▼              ▼
                       ┌────────────┐ ┌────────────┐ ┌────────────┐
                       │ Vercel API │ │ GitHub API │ │   Webhook  │
                       │  v2 + v9   │ │  (Raw)     │ │  (POST)    │
                       └────────────┘ └────────────┘ └────────────┘
```

SPA 클라이언트 + Vercel Serverless Functions. 클라이언트는 30초마다 `/api/projects`를 폴링하여 전체 프로젝트 상태를 갱신한다.

## 데이터 흐름

### GET /api/projects

1. Vercel v9 API로 전체 프로젝트 목록 조회
2. 각 프로젝트마다 병렬 처리:
   - GitHub에서 `packageinfo.md` 조회 (gray-matter로 YAML 파싱)
   - packageinfo.md가 없으면 README.md에서 첫 문장 추출 (fallback)
   - Vercel v2 API로 최신 배포 1건 조회
3. HIDDEN_PROJECTS 환경변수로 필터링
4. 30초 캐시 (s-maxage=30, stale-while-revalidate=60)

### GET /api/deployments/:id

- Vercel v2 API로 특정 프로젝트의 배포 기록 조회
- page/limit 파라미터 지원 (최대 20건/페이지)
- 15초 캐시

### POST /api/webhook

- WEBHOOK_SECRET로 서명 검증
- deployment.* 이벤트만 처리, 나머지는 무시
- 현재는 로깅만. DB 없이 클라이언트 폴링에 의존

## 컴포넌트 구조

```
App.jsx
├── Header (프로젝트 통계 + 새로고침)
├── ProjectCard[] (그리드 레이아웃)
│   └── StatusBadge (배포 상태)
└── ProjectSummary (모달)
    ├── ReactMarkdown (packageinfo.md 렌더)
    ├── StatusBadge[]
    └── 배포 히스토리 리스트
```

## packageinfo.md 컨벤션

모니터링 대상 프로젝트의 루트에 배치:

```yaml
---
summary: "프로젝트 한 줄 설명"
icon: "📊"
tags: ["tag1", "tag2"]
serviceUrl: "https://myservice.com"
deployType: "vercel"        # vercel | local | both
serviceStatus: "active"     # active | maintenance | dev | deprecated
---

여기부터 마크다운 본문 (상세 모달에서 렌더링됨)
```

### deployType 동작

| 값 | 메인 URL | 추가 URL |
|----|----------|----------|
| `vercel` (기본) | Vercel 배포 URL | - |
| `local` | serviceUrl | - |
| `both` | serviceUrl | Vercel 배포 URL |

## API 응답 형태

### /api/projects → 200

```json
{
  "projects": [
    {
      "id": "prj_xxx",
      "name": "my-project",
      "framework": "vite",
      "link": { "domain": "my-project.vercel.app", "origin": "https://my-project.vercel.app" },
      "meta": { "branch": "main", "commitSha": "abc1234", "commitAuthor": "user", "githubOrg": "dwhavi", "githubRepo": "my-project" },
      "packageInfo": { "summary": "...", "icon": "📊", "tags": [], "markdown": "...", "serviceUrl": "...", "deployType": "vercel", "serviceStatus": "active" },
      "summary": { "aliases": [], "buildTime": 12, "region": "iad1", "lastDeployAt": "2026-04-16T...", "readmeSummary": null },
      "latestDeployment": { "id": "dpl_xxx", "state": "READY", "createdAt": "...", "url": "my-project-xxx.vercel.app", "production": true, "meta": {} }
    }
  ]
}
```

## 로컬 개발

Vite dev server는 `/api` 요청을 `localhost:3000`으로 프록시한다. 로컬에서 API를 테스트하려면 별도 서버가 필요하거나 Vercel CLI의 `vercel dev`를 사용하세요.
