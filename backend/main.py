import requests
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# CORS 설정 (Next.js 접근 허용)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/search")
def search_music(q: str = ""):
    if not q:
        return {"results": []}

    # 1. iTunes API 호출 (entity=song으로 노래만 검색, limit=10으로 10개만 가져옴)
    itunes_url = f"https://itunes.apple.com/search?term={q}&entity=song&limit=10"
    response = requests.get(itunes_url)
    data = response.json()

    # 2. 필요한 데이터만 정제하기
    parsed_results = []
    for item in data.get("results", []):
        parsed_results.append({
            "id": item.get("trackId"),
            "title": item.get("trackName"),
            "artist": item.get("artistName"),
            "image": item.get("artworkUrl100") # 앨범 커버 이미지
        })

    # 3. 프론트엔드로 전달
    return {"results": parsed_results}