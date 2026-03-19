"use client";
import { useState } from "react";
import styled, { keyframes } from "styled-components";
import Image from "next/image";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";

interface Music {
  id: number;
  title: string;
  artist: string;
  album: string;
  image: string;
}

interface LyricsData {
  lyrics: string | null;
  translated: string | null;
  error?: string;
}

// ── 애니메이션 ────────────────────────────────────────────
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

// ── 스타일 ───────────────────────────────────────────────
const PageWrapper = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%);
  padding: 40px 20px 80px;
  @media (max-width: 480px) {
    padding: 24px 16px 60px;
  }
`;

const Container = styled.main`
  max-width: 680px;
  margin: 0 auto;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 40px;
  @media (max-width: 480px) {
    margin-bottom: 28px;
  }
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 800;
  color: #fff;
  margin: 0 0 6px;
  letter-spacing: -0.5px;
  @media (max-width: 480px) {
    font-size: 24px;
  }
`;

const Subtitle = styled.p`
  color: #8888aa;
  font-size: 14px;
  margin: 0;
  @media (max-width: 480px) {
    font-size: 13px;
  }
`;

const SearchBox = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 32px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 8px 8px 8px 16px;
  transition: border-color 0.2s;
  &:focus-within {
    border-color: #1db954;
  }
  @media (max-width: 480px) {
    margin-bottom: 20px;
    border-radius: 14px;
    padding: 6px 6px 6px 14px;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 15px;
  color: #fff;
  &::placeholder {
    color: #555577;
  }
  @media (max-width: 480px) {
    font-size: 14px;
  }
`;

const SearchButton = styled.button`
  padding: 10px 22px;
  font-size: 14px;
  font-weight: 700;
  background: #1db954;
  color: #fff;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;
  &:hover { background: #1ed760; }
  &:active { transform: scale(0.97); }
  @media (max-width: 480px) {
    padding: 10px 16px;
    font-size: 13px;
    border-radius: 9px;
  }
`;

const MusicList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const MusicItem = styled.li`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 14px;
  cursor: pointer;
  animation: ${fadeIn} 0.3s ease both;
  transition: background 0.2s, border-color 0.2s, transform 0.15s;
  &:hover {
    background: rgba(29, 185, 84, 0.1);
    border-color: rgba(29, 185, 84, 0.3);
    transform: translateX(4px);
  }
  @media (max-width: 480px) {
    padding: 12px 14px;
    gap: 12px;
    border-radius: 12px;
    &:hover { transform: none; }
    &:active {
      background: rgba(29, 185, 84, 0.1);
      border-color: rgba(29, 185, 84, 0.3);
    }
  }
`;

const AlbumThumb = styled.div`
  width: 52px;
  height: 52px;
  border-radius: 10px;
  overflow: hidden;
  flex-shrink: 0;
  background: #222;
`;

const MusicInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const MusicTitle = styled.div`
  font-weight: 600;
  font-size: 15px;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const MusicArtist = styled.div`
  color: #aaa;
  font-size: 13px;
  margin-top: 2px;
`;

const MusicAlbum = styled.div`
  color: #666;
  font-size: 12px;
  margin-top: 1px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ChevronIcon = styled.div`
  color: #444;
  font-size: 18px;
  flex-shrink: 0;
  transition: color 0.2s;
  ${MusicItem}:hover & { color: #1db954; }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 20px;
  animation: ${fadeIn} 0.2s ease;
`;

const Modal = styled.div`
  background: #1a1a2e;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 28px;
  max-width: 560px;
  width: 100%;
  max-height: 82vh;
  overflow-y: auto;
  position: relative;
  animation: ${fadeIn} 0.25s ease;
  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
  @media (max-width: 480px) {
    padding: 20px 16px;
    border-radius: 16px;
    max-height: 88vh;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
`;

const ModalAlbumArt = styled.div`
  width: 72px;
  height: 72px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
  background: #222;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
`;

const ModalMusicInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ModalTitle = styled.div`
  font-weight: 700;
  font-size: 18px;
  color: #fff;
`;

const ModalArtist = styled.div`
  color: #aaa;
  font-size: 14px;
  margin-top: 3px;
`;

const ModalAlbum = styled.div`
  color: #666;
  font-size: 13px;
  margin-top: 2px;
`;

const CloseButton = styled.button`
  background: rgba(255, 255, 255, 0.08);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 16px;
  cursor: pointer;
  color: #aaa;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.2s, color 0.2s;
  &:hover { background: rgba(255,255,255,0.15); color: #fff; }
`;

const TabRow = styled.div`
  display: flex;
  gap: 6px;
  margin-bottom: 20px;
  background: rgba(255,255,255,0.05);
  border-radius: 12px;
  padding: 4px;
`;

const Tab = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 8px 0;
  border-radius: 9px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
  transition: background 0.2s, color 0.2s;
  background: ${({ $active }) => ($active ? "#1db954" : "transparent")};
  color: ${({ $active }) => ($active ? "#fff" : "#777")};
`;

const LyricsText = styled.pre`
  white-space: pre-wrap;
  font-size: 14px;
  line-height: 2;
  color: #ccc;
  margin: 0;
  font-family: inherit;
`;

const Spinner = styled.div`
  width: 28px;
  height: 28px;
  border: 3px solid rgba(255,255,255,0.1);
  border-top-color: #1db954;
  border-radius: 50%;
  animation: ${spin} 0.7s linear infinite;
  margin: 32px auto;
`;

const StatusText = styled.p`
  text-align: center;
  color: #666;
  font-size: 14px;
`;

const ErrorText = styled.p`
  text-align: center;
  color: #e55;
  font-size: 14px;
`;

const EmptyState = styled.div`
  text-align: center;
  color: #444;
  font-size: 14px;
  padding: 60px 0;
`;

// ── 컴포넌트 ─────────────────────────────────────────────
export default function Home() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Music[]>([]);
  const [searched, setSearched] = useState(false);
  const [selectedMusic, setSelectedMusic] = useState<Music | null>(null);
  const [lyricsData, setLyricsData] = useState<LyricsData | null>(null);
  const [lyricsLoading, setLyricsLoading] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data?.results) setResults(data.results);
      setSearched(true);
    } catch (error) {
      console.error("검색 실패:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleMusicClick = async (music: Music) => {
    setSelectedMusic(music);
    setLyricsData(null);
    setShowTranslation(false);
    setLyricsLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/lyrics?artist=${encodeURIComponent(music.artist)}&title=${encodeURIComponent(music.title)}`
      );
      setLyricsData(await res.json());
    } catch {
      setLyricsData({ lyrics: null, translated: null, error: "가사를 불러오지 못했습니다" });
    } finally {
      setLyricsLoading(false);
    }
  };

  const closeModal = () => setSelectedMusic(null);

  return (
    <PageWrapper>
      <Container>
        <Header>
          <Title>🎵 음악 검색</Title>
          <Subtitle>곡명이나 아티스트를 검색하고 가사를 확인해보세요</Subtitle>
        </Header>

        <SearchBox>
          <SearchInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="곡명 또는 아티스트 검색..."
          />
          <SearchButton onClick={handleSearch}>검색</SearchButton>
        </SearchBox>

        <MusicList>
          {results.map((music, index) => (
            <MusicItem key={`${music.id}-${index}`} onClick={() => handleMusicClick(music)} style={{ animationDelay: `${index * 40}ms` }}>
              <AlbumThumb>
                {music.image && (
                  <Image src={music.image} alt={music.title} width={52} height={52} style={{ display: "block" }} />
                )}
              </AlbumThumb>
              <MusicInfo>
                <MusicTitle>{music.title}</MusicTitle>
                <MusicArtist>{music.artist}</MusicArtist>
                {music.album && <MusicAlbum>{music.album}</MusicAlbum>}
              </MusicInfo>
              <ChevronIcon>›</ChevronIcon>
            </MusicItem>
          ))}
        </MusicList>

        {searched && results.length === 0 && (
          <EmptyState>검색 결과가 없습니다</EmptyState>
        )}

        {selectedMusic && (
          <Overlay onClick={closeModal}>
            <Modal onClick={(e) => e.stopPropagation()}>
              <ModalHeader>
                <ModalAlbumArt>
                  {selectedMusic.image && (
                    <Image src={selectedMusic.image} alt={selectedMusic.title} width={72} height={72} style={{ display: "block" }} />
                  )}
                </ModalAlbumArt>
                <ModalMusicInfo>
                  <ModalTitle>{selectedMusic.title}</ModalTitle>
                  <ModalArtist>{selectedMusic.artist}</ModalArtist>
                  {selectedMusic.album && <ModalAlbum>{selectedMusic.album}</ModalAlbum>}
                </ModalMusicInfo>
                <CloseButton onClick={closeModal}>✕</CloseButton>
              </ModalHeader>

              {lyricsLoading && <Spinner />}

              {!lyricsLoading && lyricsData?.error && <ErrorText>{lyricsData.error}</ErrorText>}

              {!lyricsLoading && lyricsData?.lyrics && (
                <>
                  <TabRow>
                    <Tab $active={!showTranslation} onClick={() => setShowTranslation(false)}>
                      원문
                    </Tab>
                    <Tab $active={showTranslation} onClick={() => setShowTranslation(true)}>
                      한국어 번역
                    </Tab>
                  </TabRow>
                  <LyricsText>
                    {showTranslation
                      ? (lyricsData.translated ?? "번역을 불러오지 못했습니다")
                      : lyricsData.lyrics}
                  </LyricsText>
                </>
              )}

              {!lyricsLoading && !lyricsData && <StatusText>가사 정보 없음</StatusText>}
            </Modal>
          </Overlay>
        )}
      </Container>
    </PageWrapper>
  );
}
