# YouTube Script Chatbot - Cloud Function 배포 가이드

이 프로젝트의 서버 부분만 Google Cloud Run Function으로 배포하는 방법을 설명합니다.

## 사전 요구사항

1. Google Cloud SDK 설치 및 로그인
2. Google Cloud 프로젝트 생성
3. Cloud Functions API 활성화
4. 필요한 환경변수 설정

## 환경변수 설정

배포 전에 다음 환경변수들을 설정해야 합니다:

```bash
export SEARCH_API_KEY="your_search_api_key"
export OPENAI_API_KEY="your_openai_api_key"
export DATABASE_URL="your_database_url"
```

## 배포 방법

### 1. 의존성 설치

```bash
npm install
```

### 2. 서버 빌드

```bash
npm run build:server
```

### 3. Cloud Function 배포

```bash
npm run deploy
```

또는 직접 gcloud 명령어 사용:

```bash
gcloud functions deploy youtube-script-api \
  --gen2 \
  --runtime=nodejs20 \
  --region=us-central1 \
  --source=. \
  --entry-point=youtubeScriptApi \
  --trigger-http \
  --allow-unauthenticated \
  --memory=1GiB \
  --timeout=300s \
  --set-env-vars NODE_ENV=production,SEARCH_API_KEY=${SEARCH_API_KEY},OPENAI_API_KEY=${OPENAI_API_KEY},DATABASE_URL=${DATABASE_URL}
```

## API 엔드포인트

배포된 함수는 다음과 같은 엔드포인트를 제공합니다:

- `POST /api/extract-transcript` - YouTube 영상에서 자막 추출
- `GET /api/transcripts/:id` - 자막 조회
- `POST /api/transcripts` - 자막 저장
- `GET /api/transcripts/:id/summary` - 자막 요약 생성

## 로컬 테스트

배포 전 로컬에서 테스트할 수 있습니다:

```bash
# 빌드
npm run build:server

# Functions Framework로 로컬 실행
npx functions-framework --target=youtubeScriptApi --source=dist --signature-type=http

# 테스트
curl -X GET http://localhost:8080/
```

## 주요 변경사항

1. **Express 앱을 Cloud Function으로 변환**: `index.ts`에서 `http()` 함수로 래핑
2. **CORS 설정 추가**: 브라우저에서 호출할 수 있도록 CORS 헤더 설정
3. **번들링**: esbuild를 사용하여 모든 코드를 하나의 파일로 번들링
4. **의존성 관리**: 외부 패키지들은 external로 처리

## 배포 후 확인

배포가 완료되면 다음과 같이 확인할 수 있습니다:

```bash
# 함수 목록 확인
gcloud functions list

# 함수 호출 테스트
curl -X GET https://us-central1-PROJECT_ID.cloudfunctions.net/youtube-script-api
```

## 트러블슈팅

1. **권한 오류**: IAM 권한 확인
2. **메모리 부족**: 메모리 할당량 증가 (`--memory=2GiB`)
3. **타임아웃**: 타임아웃 시간 증가 (`--timeout=540s`)

## 비용 최적화

- 메모리와 CPU 할당량을 실제 필요에 맞게 조정
- 동시 실행 수 제한 설정
- 불필요한 의존성 제거
