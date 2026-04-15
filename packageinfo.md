---
summary: "Vercel 프로젝트 배포 현황을 한눈에 모니터링하는 대시보드"
icon: "📊"
tags: ["vercel", "dashboard", "monitoring", "react"]
serviceUrl: "https://vercel-dashboard-rose.vercel.app"
deployType: "both"
serviceStatus: "active"
---

# 사용 기술

- React 19.2.4
- Vite 8.0.4
- Tailwind CSS v4.2.2
- Gray-matter (YAML 파싱)
- React-Markdown (마크다운 렌더링)

# 프로젝트 구조

```
src/
  components/
    ProjectCard.jsx      # 프로젝트 카드 컴포넌트
    DeploymentList.jsx   # 배포 기록 모달 (이전)
    ProjectSummary.jsx   # 프로젝트 상세 모달
  App.jsx               # 메인 앱
  main.jsx              # 엔트리 포인트
api/
  projects.js           # 프로젝트 목록 API
  webhook.js            # 웹훅 수신
  deployments/[id].js   # 배포 기록 API
```

# 기능

## 대시보드
- 전체 프로젝트 목록 카드 형태 표시
- 실시간 배포 상태 (READY, BUILDING, ERROR, QUEUED)
- 30초 자동 폴링 새로고침
- 배포 현황 요약 (전체, 정상, 빌드중, 에러)
- 수동 새로고침 버튼

## 프로젝트 카드
- 프로젝트 이름, 프레임워크, 배지
- 프로젝트 요약 (packageinfo.md/README/커밋 메시지)
- 아이콘, 태그 표시
- 최신 배포 상태 배지
- 서비스 상태 배지 (운영 중, 점검 중, 개발 중, 폐기 예정)
- 커밋 정보 (브랜치, SHA, 작성자)
- GitHub 저장소 정보
- 배포 URL 링크 (Vercel/로컬/선택적)
- 빌드 시간, 마지막 배포 시간

## 프로젝트 상세
- packageinfo.md 전체 내용 마크다운 렌더링
- 최근 배포 히스토리 (최신 5개)
- 배포별 상태, URL, 날짜

## GitHub 통합
- packageinfo.md 자동 로드 (YAML 프론트매터 파싱)
- README.md 자동 요약
- 커밋 메타데이터 추출
- 파일 없는 경우 안전한 에러 처리

## Webhook
- 배포 이벤트 수신 (created, succeeded, failed, ready, canceled)
- WEBHOOK_SECRET 보안 지원

# 배포 유형 지원

packageinfo.md에서 배포 유형을 설정할 수 있습니다:

- `vercel` (기본): Vercel 배포 URL만 표시
- `local`: 로컬 서비스 URL (serviceUrl)만 표시
- `both`: 서비스 URL (메인) + Vercel URL 모두 표시

예시:
```yaml
serviceUrl: "https://myservice.com"
deployType: "both"
serviceStatus: "active"
```

# API

| 엔드포인트 | 설명 |
|-----------|------|
| GET /api/projects | 프로젝트 목록 + GitHub 정보 |
| POST /api/webhook | 웹훅 이벤트 수신 |
| GET /api/deployments/:id | 프로젝트 배포 기록 |

# 환경 변수

- `VERCEL_TOKEN` (필수): Vercel API 토큰
- `WEBHOOK_SECRET` (선택): 웹훅 보안 키
