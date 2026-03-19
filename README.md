# 🎵 음악 검색 앱

곡명이나 아티스트를 검색하면 iTunes API로 음악을 찾아주고, 가사와 한국어 번역을 제공하는 웹 앱입니다.

## 기술 스택

| 구분 | 기술 |
|------|------|
| 프론트엔드 | Next.js 16, styled-components |
| 백엔드 | FastAPI, Python |
| 음악 데이터 | iTunes Search API |
| 가사 | lyrics.ovh |
| 번역 | Google Translate (deep-translator) |

## 로컬 실행

### 백엔드

```bash
cd MusicProject
venv\Scripts\activate       # Windows
source venv/bin/activate    # macOS/Linux

cd backend
uvicorn main:app --reload
# → http://localhost:8000
```

### 프론트엔드

```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

## API

| 엔드포인트 | 설명 |
|-----------|------|
| `GET /search?q={검색어}` | 음악 검색 (iTunes) |
| `GET /lyrics?artist={아티스트}&title={곡명}` | 가사 + 한국어 번역 |

## 배포

백엔드는 [Render](https://render.com)에 배포되어 있습니다.
프론트엔드의 `NEXT_PUBLIC_API_BASE` 환경변수로 백엔드 URL을 지정할 수 있습니다.
