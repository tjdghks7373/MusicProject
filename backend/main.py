import requests
from urllib.parse import quote
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from deep_translator import GoogleTranslator

app = FastAPI()

# CORS 설정 (Next.js 접근 허용)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/search")
def search_music(q: str = ""):
    if not q:
        return {"results": []}

    # iTunes API 호출
    itunes_url = f"https://itunes.apple.com/search?term={quote(q)}&entity=song&limit=10"
    response = requests.get(itunes_url, timeout=10)
    data = response.json()

    parsed_results = []
    for item in data.get("results", []):
        parsed_results.append({
            "id": item.get("trackId"),
            "title": item.get("trackName"),
            "artist": item.get("artistName"),
            "album": item.get("collectionName"),
            "image": item.get("artworkUrl100"),
        })

    return {"results": parsed_results}


@app.get("/lyrics")
def get_lyrics(artist: str, title: str):
    # lyrics.ovh에서 가사 가져오기 (무료, API키 불필요)
    url = f"https://api.lyrics.ovh/v1/{quote(artist)}/{quote(title)}"
    try:
        response = requests.get(url, timeout=10)
    except Exception:
        return {"lyrics": None, "translated": None, "error": "가사를 불러오는 중 오류가 발생했습니다"}

    if response.status_code != 200:
        return {"lyrics": None, "translated": None, "error": "가사를 찾을 수 없습니다"}

    lyrics = response.json().get("lyrics", "")
    if not lyrics:
        return {"lyrics": None, "translated": None, "error": "가사가 없습니다"}

    # 한국어 번역 (Google Translate, 최대 4500자)
    try:
        translated = GoogleTranslator(source="auto", target="ko").translate(lyrics[:4500])
    except Exception:
        translated = None

    return {"lyrics": lyrics, "translated": translated}
