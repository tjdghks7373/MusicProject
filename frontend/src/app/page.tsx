"use client";
import { useState, useEffect } from "react";
import styled, { keyframes, css } from "styled-components";
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

// 샘플 데이터
const trendingTracks: Music[] = [
  { id: 1, title: "APT.", artist: "ROSÉ & Bruno Mars", album: "APT.", image: "https://i.scdn.co/image/ab67616d0000b273b87d84eb5078886e5cee6d5b" },
  { id: 2, title: "Die With A Smile", artist: "Lady Gaga, Bruno Mars", album: "Die With A Smile", image: "https://i.scdn.co/image/ab67616d0000b2736983a0c8e0c7d74b4bd22cb4" },
  { id: 3, title: "Espresso", artist: "Sabrina Carpenter", album: "Short n' Sweet", image: "https://i.scdn.co/image/ab67616d0000b2738e3fedfe054d3b2bf9c50b50" },
  { id: 4, title: "Birds of a Feather", artist: "Billie Eilish", album: "HIT ME HARD AND SOFT", image: "https://i.scdn.co/image/ab67616d0000b27371d62ea7ea8a5be92d3c1f62" },
];

const genres = [
  { name: "K-POP", color: "#FF6B9D", icon: "🇰🇷" },
  { name: "POP", color: "#1DB954", icon: "🎤" },
  { name: "Hip-Hop", color: "#FF9500", icon: "🎤" },
  { name: "R&B", color: "#AF52DE", icon: "💜" },
  { name: "Rock", color: "#FF3B30", icon: "🎸" },
  { name: "Electronic", color: "#5856D6", icon: "🎧" },
];

const recentSearches = ["NewJeans", "IU", "BTS", "aespa", "Taylor Swift"];

// ── 애니메이션 ────────────────────────────────────────────
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const fadeInScale = keyframes`
  from { opacity: 0; transform: scale(0.95); }
  to   { opacity: 1; transform: scale(1); }
`;

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
`;

const waveAnimation = keyframes`
  0%, 100% { height: 8px; }
  50% { height: 20px; }
`;

// ── 스타일 ───────────────────────────────────────────────
const PageWrapper = styled.div`
  min-height: 100vh;
  background: linear-gradient(180deg, #0a0a0f 0%, #121218 50%, #0d0d12 100%);
  color: #fff;
  overflow-x: hidden;
`;

const BackgroundGlow = styled.div`
  position: fixed;
  top: -200px;
  left: 50%;
  transform: translateX(-50%);
  width: 800px;
  height: 600px;
  background: radial-gradient(ellipse, rgba(29, 185, 84, 0.15) 0%, transparent 70%);
  pointer-events: none;
  z-index: 0;
`;

const Container = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  position: relative;
  z-index: 1;
`;

// ── 헤더 ───────────────────────────────────────────────
const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 0;
  margin-bottom: 24px;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const LogoIcon = styled.div`
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #1DB954 0%, #1ed760 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  box-shadow: 0 8px 24px rgba(29, 185, 84, 0.3);
`;

const LogoText = styled.h1`
  font-size: 24px;
  font-weight: 800;
  color: #fff;
  margin: 0;
  letter-spacing: -0.5px;
`;

const NavLinks = styled.nav`
  display: flex;
  gap: 32px;
  @media (max-width: 768px) {
    display: none;
  }
`;

const NavLink = styled.a`
  color: #888;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  transition: color 0.2s;
  cursor: pointer;
  &:hover { color: #fff; }
`;

// ── 히어로 섹션 ───────────────────────────────────────────
const HeroSection = styled.section`
  text-align: center;
  padding: 60px 0 48px;
  animation: ${fadeIn} 0.6s ease;
  @media (max-width: 768px) {
    padding: 40px 0 32px;
  }
`;

const HeroTitle = styled.h2`
  font-size: 56px;
  font-weight: 900;
  margin: 0 0 16px;
  letter-spacing: -2px;
  line-height: 1.1;
  background: linear-gradient(135deg, #fff 0%, #888 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  @media (max-width: 768px) {
    font-size: 36px;
    letter-spacing: -1px;
  }
`;

const HeroSubtitle = styled.p`
  color: #666;
  font-size: 18px;
  margin: 0 0 40px;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
  @media (max-width: 768px) {
    font-size: 15px;
    margin-bottom: 32px;
  }
`;

// ── 검색 바 ───────────────────────────────────────────────
const SearchContainer = styled.div`
  max-width: 640px;
  margin: 0 auto 20px;
`;

const SearchBox = styled.div<{ $focused?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid ${props => props.$focused ? '#1DB954' : 'rgba(255, 255, 255, 0.08)'};
  border-radius: 20px;
  padding: 6px 8px 6px 20px;
  transition: all 0.3s ease;
  box-shadow: ${props => props.$focused ? '0 0 40px rgba(29, 185, 84, 0.15)' : 'none'};
  
  &:hover {
    border-color: rgba(255, 255, 255, 0.15);
  }
`;

const SearchIconWrapper = styled.div`
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
`;

const SearchInput = styled.input`
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 16px;
  color: #fff;
  padding: 14px 0;
  &::placeholder {
    color: #555;
  }
`;

const SearchButton = styled.button`
  padding: 14px 32px;
  font-size: 15px;
  font-weight: 700;
  background: linear-gradient(135deg, #1DB954 0%, #1ed760 100%);
  color: #000;
  border: none;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 16px rgba(29, 185, 84, 0.3);
  &:hover { 
    transform: translateY(-2px);
    box-shadow: 0 6px 24px rgba(29, 185, 84, 0.4);
  }
  &:active { transform: translateY(0); }
  @media (max-width: 480px) {
    padding: 14px 24px;
    font-size: 14px;
  }
`;

// ── 최근 검색 ───────────────────────────────────────────
const RecentSearches = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 16px;
  animation: ${fadeIn} 0.6s ease 0.2s both;
`;

const RecentLabel = styled.span`
  color: #555;
  font-size: 13px;
`;

const RecentTag = styled.button`
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #aaa;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    background: rgba(29, 185, 84, 0.15);
    border-color: rgba(29, 185, 84, 0.3);
    color: #1DB954;
  }
`;

// ── 섹션 제목 ───────────────────────────────────────────
const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
`;

const SectionTitle = styled.h3`
  font-size: 24px;
  font-weight: 800;
  color: #fff;
  margin: 0;
  letter-spacing: -0.5px;
`;

const SeeAllLink = styled.a`
  color: #888;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.2s;
  &:hover { color: #1DB954; }
`;

// ── 장르 그리드 ───────────────────────────────────────────
const GenreSection = styled.section`
  padding: 48px 0;
  animation: ${fadeIn} 0.6s ease 0.3s both;
`;

const GenreGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
  @media (max-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
  @media (max-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
`;

const GenreCard = styled.button<{ $color: string }>`
  background: ${props => `linear-gradient(135deg, ${props.$color}20 0%, ${props.$color}05 100%)`};
  border: 1px solid ${props => `${props.$color}30`};
  border-radius: 16px;
  padding: 24px 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  
  &:hover {
    transform: translateY(-4px);
    background: ${props => `linear-gradient(135deg, ${props.$color}30 0%, ${props.$color}10 100%)`};
    box-shadow: 0 12px 32px ${props => `${props.$color}20`};
  }
  
  @media (max-width: 640px) {
    padding: 20px 12px;
  }
`;

const GenreIcon = styled.span`
  font-size: 28px;
  display: block;
  margin-bottom: 8px;
`;

const GenreName = styled.span`
  color: #fff;
  font-weight: 700;
  font-size: 14px;
`;

// ── 트렌딩 섹션 ───────────────────────────────────────────
const TrendingSection = styled.section`
  padding: 48px 0;
  animation: ${fadeIn} 0.6s ease 0.4s both;
`;

const TrendingGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
`;

const TrendingCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.06);
    transform: translateY(-4px);
    border-color: rgba(29, 185, 84, 0.3);
  }
`;

const TrendingAlbumArt = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 14px;
  background: #1a1a1f;
`;

const PlayOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
  
  ${TrendingCard}:hover & {
    opacity: 1;
  }
`;

const PlayButton = styled.div`
  width: 52px;
  height: 52px;
  background: #1DB954;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  transform: scale(0.9);
  transition: transform 0.2s;
  
  ${TrendingCard}:hover & {
    transform: scale(1);
  }
`;

const TrendingRank = styled.span`
  position: absolute;
  top: 8px;
  left: 8px;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  font-weight: 800;
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 20px;
  backdrop-filter: blur(4px);
`;

const TrendingInfo = styled.div`
  padding: 0 4px;
`;

const TrendingTitle = styled.div`
  font-weight: 700;
  font-size: 15px;
  color: #fff;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TrendingArtist = styled.div`
  color: #888;
  font-size: 13px;
`;

// ── 검색 결과 섹션 ───────────────────────────────────────
const ResultsSection = styled.section`
  padding: 32px 0 80px;
`;

const ResultsHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
`;

const ResultsCount = styled.span`
  background: rgba(29, 185, 84, 0.15);
  color: #1DB954;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
`;

const MusicList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const MusicItem = styled.li<{ $delay?: number }>`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 14px;
  cursor: pointer;
  animation: ${slideIn} 0.4s ease both;
  animation-delay: ${props => props.$delay || 0}ms;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(29, 185, 84, 0.08);
    border-color: rgba(29, 185, 84, 0.2);
    transform: translateX(4px);
  }
`;

const MusicItemNumber = styled.span`
  color: #444;
  font-size: 14px;
  font-weight: 700;
  width: 24px;
  text-align: center;
  flex-shrink: 0;
`;

const AlbumThumb = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 10px;
  overflow: hidden;
  flex-shrink: 0;
  background: #1a1a1f;
  position: relative;
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
  margin-bottom: 2px;
`;

const MusicArtist = styled.div`
  color: #888;
  font-size: 13px;
`;

const MusicAlbum = styled.div`
  color: #555;
  font-size: 12px;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const MusicDuration = styled.span`
  color: #555;
  font-size: 13px;
  font-weight: 500;
  margin-right: 8px;
`;

const MusicActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ActionButton = styled.button`
  background: transparent;
  border: none;
  color: #555;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: #1DB954;
    background: rgba(29, 185, 84, 0.1);
  }
`;

// ── 모달 ───────────────────────────────────────────────
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(20px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 20px;
  animation: ${fadeIn} 0.2s ease;
`;

const Modal = styled.div`
  background: linear-gradient(180deg, #1a1a22 0%, #121218 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  max-width: 600px;
  width: 100%;
  max-height: 85vh;
  overflow: hidden;
  position: relative;
  animation: ${fadeInScale} 0.3s ease;
`;

const ModalGradient = styled.div<{ $image?: string }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 200px;
  background: ${props => props.$image 
    ? `linear-gradient(180deg, rgba(29, 185, 84, 0.3) 0%, transparent 100%)`
    : 'linear-gradient(180deg, rgba(29, 185, 84, 0.2) 0%, transparent 100%)'};
  pointer-events: none;
`;

const ModalContent = styled.div`
  position: relative;
  z-index: 1;
  padding: 32px;
  max-height: 85vh;
  overflow-y: auto;
  
  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: #333; border-radius: 6px; }
`;

const ModalHeader = styled.div`
  display: flex;
  gap: 20px;
  align-items: flex-start;
  margin-bottom: 28px;
`;

const ModalAlbumArt = styled.div`
  width: 140px;
  height: 140px;
  border-radius: 16px;
  overflow: hidden;
  flex-shrink: 0;
  background: #222;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5);
  
  @media (max-width: 480px) {
    width: 100px;
    height: 100px;
  }
`;

const ModalMusicInfo = styled.div`
  flex: 1;
  min-width: 0;
  padding-top: 8px;
`;

const ModalTitle = styled.div`
  font-weight: 800;
  font-size: 26px;
  color: #fff;
  margin-bottom: 8px;
  letter-spacing: -0.5px;
  
  @media (max-width: 480px) {
    font-size: 20px;
  }
`;

const ModalArtist = styled.div`
  color: #1DB954;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
`;

const ModalAlbum = styled.div`
  color: #666;
  font-size: 14px;
`;

const ModalActions = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 16px;
`;

const ModalPlayButton = styled.button`
  background: #1DB954;
  border: none;
  color: #000;
  padding: 12px 28px;
  border-radius: 50px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  
  &:hover {
    transform: scale(1.05);
    background: #1ed760;
  }
`;

const ModalIconButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #fff;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  font-size: 18px;
  cursor: pointer;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  transition: all 0.2s;
  backdrop-filter: blur(8px);
  
  &:hover { 
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.1);
  }
`;

const TabRow = styled.div`
  display: flex;
  gap: 4px;
  margin-bottom: 24px;
  background: rgba(255,255,255,0.05);
  border-radius: 14px;
  padding: 4px;
`;

const Tab = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 12px 0;
  border-radius: 11px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s;
  background: ${({ $active }) => ($active ? "#1DB954" : "transparent")};
  color: ${({ $active }) => ($active ? "#000" : "#777")};
  
  &:hover {
    color: ${({ $active }) => ($active ? "#000" : "#fff")};
  }
`;

const LyricsContainer = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16px;
  padding: 24px;
`;

const LyricsText = styled.pre`
  white-space: pre-wrap;
  font-size: 15px;
  line-height: 2.2;
  color: #bbb;
  margin: 0;
  font-family: inherit;
`;

const Spinner = styled.div`
  width: 32px;
  height: 32px;
  border: 3px solid rgba(255,255,255,0.1);
  border-top-color: #1DB954;
  border-radius: 50%;
  animation: ${spin} 0.7s linear infinite;
  margin: 48px auto;
`;

const StatusText = styled.p`
  text-align: center;
  color: #555;
  font-size: 15px;
  padding: 32px 0;
`;

const ErrorText = styled.p`
  text-align: center;
  color: #ff6b6b;
  font-size: 15px;
  padding: 32px 0;
`;

const EmptyState = styled.div`
  text-align: center;
  color: #444;
  font-size: 15px;
  padding: 80px 0;
`;

// ── 웨이브 애니메이션 ───────────────────────────────────────
const WaveContainer = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 24px;
`;

const WaveBar = styled.div<{ $delay: number }>`
  width: 4px;
  background: #1DB954;
  border-radius: 2px;
  animation: ${waveAnimation} 0.8s ease-in-out infinite;
  animation-delay: ${props => props.$delay}s;
`;

// ── 나우 플레잉 바 ───────────────────────────────────────
const NowPlayingBar = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(180deg, rgba(18, 18, 24, 0.95) 0%, #121218 100%);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding: 12px 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  backdrop-filter: blur(20px);
  z-index: 50;
`;

const NowPlayingInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  flex: 1;
  min-width: 0;
`;

const NowPlayingThumb = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  background: #1a1a1f;
`;

const NowPlayingText = styled.div`
  flex: 1;
  min-width: 0;
`;

const NowPlayingTitle = styled.div`
  font-weight: 600;
  font-size: 14px;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const NowPlayingArtist = styled.div`
  color: #888;
  font-size: 12px;
`;

const NowPlayingControls = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const ControlButton = styled.button<{ $primary?: boolean }>`
  background: ${props => props.$primary ? '#1DB954' : 'transparent'};
  border: none;
  color: ${props => props.$primary ? '#000' : '#fff'};
  width: ${props => props.$primary ? '40px' : '32px'};
  height: ${props => props.$primary ? '40px' : '32px'};
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  
  &:hover {
    transform: scale(1.1);
    background: ${props => props.$primary ? '#1ed760' : 'rgba(255,255,255,0.1)'};
  }
`;

// ── 푸터 ───────────────────────────────────────────────
const Footer = styled.footer`
  text-align: center;
  padding: 60px 0 100px;
  color: #444;
  font-size: 13px;
`;

// ── 아이콘 컴포넌트 ───────────────────────────────────────
const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <circle cx="11" cy="11" r="8"/>
    <path d="M21 21l-4.35-4.35"/>
  </svg>
);

const PlayIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z"/>
  </svg>
);

const PauseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <rect x="6" y="4" width="4" height="16"/>
    <rect x="14" y="4" width="4" height="16"/>
  </svg>
);

const HeartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

const SkipBackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="19 20 9 12 19 4 19 20"/>
    <line x1="5" y1="19" x2="5" y2="5" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

const SkipForwardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="5 4 15 12 5 20 5 4"/>
    <line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

const MoreIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="12" r="1.5"/>
    <circle cx="19" cy="12" r="1.5"/>
    <circle cx="5" cy="12" r="1.5"/>
  </svg>
);

// ── 컴포넌트 ─────────────────────────────────────────────
export default function Home() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Music[]>([]);
  const [searched, setSearched] = useState(false);
  const [selectedMusic, setSelectedMusic] = useState<Music | null>(null);
  const [lyricsData, setLyricsData] = useState<LyricsData | null>(null);
  const [lyricsLoading, setLyricsLoading] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Music | null>(null);

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

  const handleRecentSearch = (term: string) => {
    setQuery(term);
    setTimeout(handleSearch, 100);
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

  const handlePlay = (music: Music, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentTrack(music);
    setIsPlaying(true);
  };

  const closeModal = () => setSelectedMusic(null);

  return (
    <PageWrapper>
      <BackgroundGlow />
      
      <Container>
        {/* 헤더 */}
        <Header>
          <Logo>
            <LogoIcon>♪</LogoIcon>
            <LogoText>Melodify</LogoText>
          </Logo>
          <NavLinks>
            <NavLink>탐색</NavLink>
            <NavLink>라이브러리</NavLink>
            <NavLink>플레이리스트</NavLink>
          </NavLinks>
        </Header>

        {/* 히어로 섹션 */}
        <HeroSection>
          <HeroTitle>
            음악을 발견하고<br />가사를 탐험하세요
          </HeroTitle>
          <HeroSubtitle>
            수백만 곡의 음악과 가사를 검색하고, 좋아하는 음악의 의미를 더 깊이 이해해보세요
          </HeroSubtitle>

          {/* 검색 바 */}
          <SearchContainer>
            <SearchBox $focused={searchFocused}>
              <SearchIconWrapper>
                <SearchIcon />
              </SearchIconWrapper>
              <SearchInput
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder="곡명, 아티스트, 앨범 검색..."
              />
              <SearchButton onClick={handleSearch}>검색</SearchButton>
            </SearchBox>
            
            <RecentSearches>
              <RecentLabel>최근 검색:</RecentLabel>
              {recentSearches.map((term) => (
                <RecentTag key={term} onClick={() => handleRecentSearch(term)}>
                  {term}
                </RecentTag>
              ))}
            </RecentSearches>
          </SearchContainer>
        </HeroSection>

        {/* 검색 결과 */}
        {searched && (
          <ResultsSection>
            <ResultsHeader>
              <SectionTitle>검색 결과</SectionTitle>
              <ResultsCount>{results.length}곡</ResultsCount>
            </ResultsHeader>
            
            {results.length > 0 ? (
              <MusicList>
                {results.map((music, index) => (
                  <MusicItem 
                    key={`${music.id}-${index}`} 
                    onClick={() => handleMusicClick(music)}
                    $delay={index * 50}
                  >
                    <MusicItemNumber>{index + 1}</MusicItemNumber>
                    <AlbumThumb>
                      {music.image && (
                        <Image 
                          src={music.image} 
                          alt={music.title} 
                          fill
                          style={{ objectFit: "cover" }} 
                        />
                      )}
                    </AlbumThumb>
                    <MusicInfo>
                      <MusicTitle>{music.title}</MusicTitle>
                      <MusicArtist>{music.artist}</MusicArtist>
                      {music.album && <MusicAlbum>{music.album}</MusicAlbum>}
                    </MusicInfo>
                    <MusicActions>
                      <ActionButton onClick={(e) => handlePlay(music, e)}>
                        <PlayIcon />
                      </ActionButton>
                      <ActionButton>
                        <HeartIcon />
                      </ActionButton>
                      <ActionButton>
                        <MoreIcon />
                      </ActionButton>
                    </MusicActions>
                  </MusicItem>
                ))}
              </MusicList>
            ) : (
              <EmptyState>
                &apos;{query}&apos;에 대한 검색 결과가 없습니다
              </EmptyState>
            )}
          </ResultsSection>
        )}

        {/* 장르 섹션 */}
        {!searched && (
          <>
            <GenreSection>
              <SectionHeader>
                <SectionTitle>장르별 탐색</SectionTitle>
                <SeeAllLink>전체 보기</SeeAllLink>
              </SectionHeader>
              <GenreGrid>
                {genres.map((genre) => (
                  <GenreCard key={genre.name} $color={genre.color}>
                    <GenreIcon>{genre.icon}</GenreIcon>
                    <GenreName>{genre.name}</GenreName>
                  </GenreCard>
                ))}
              </GenreGrid>
            </GenreSection>

            {/* 트렌딩 섹션 */}
            <TrendingSection>
              <SectionHeader>
                <SectionTitle>지금 인기 있는 곡</SectionTitle>
                <SeeAllLink>전체 보기</SeeAllLink>
              </SectionHeader>
              <TrendingGrid>
                {trendingTracks.map((track, index) => (
                  <TrendingCard key={track.id} onClick={() => handleMusicClick(track)}>
                    <TrendingAlbumArt>
                      <Image 
                        src={track.image} 
                        alt={track.title} 
                        fill
                        style={{ objectFit: "cover" }} 
                      />
                      <TrendingRank>#{index + 1}</TrendingRank>
                      <PlayOverlay>
                        <PlayButton onClick={(e) => handlePlay(track, e)}>
                          <PlayIcon />
                        </PlayButton>
                      </PlayOverlay>
                    </TrendingAlbumArt>
                    <TrendingInfo>
                      <TrendingTitle>{track.title}</TrendingTitle>
                      <TrendingArtist>{track.artist}</TrendingArtist>
                    </TrendingInfo>
                  </TrendingCard>
                ))}
              </TrendingGrid>
            </TrendingSection>
          </>
        )}

        <Footer>
          © 2024 Melodify. 모든 음악 데이터는 각 권리자에게 귀속됩니다.
        </Footer>
      </Container>

      {/* 모달 */}
      {selectedMusic && (
        <Overlay onClick={closeModal}>
          <Modal onClick={(e) => e.stopPropagation()}>
            <ModalGradient $image={selectedMusic.image} />
            <CloseButton onClick={closeModal}>✕</CloseButton>
            
            <ModalContent>
              <ModalHeader>
                <ModalAlbumArt>
                  {selectedMusic.image && (
                    <Image 
                      src={selectedMusic.image} 
                      alt={selectedMusic.title} 
                      fill
                      style={{ objectFit: "cover" }} 
                    />
                  )}
                </ModalAlbumArt>
                <ModalMusicInfo>
                  <ModalTitle>{selectedMusic.title}</ModalTitle>
                  <ModalArtist>{selectedMusic.artist}</ModalArtist>
                  {selectedMusic.album && <ModalAlbum>{selectedMusic.album}</ModalAlbum>}
                  
                  <ModalActions>
                    <ModalPlayButton onClick={() => handlePlay(selectedMusic)}>
                      <PlayIcon /> 재생
                    </ModalPlayButton>
                    <ModalIconButton>
                      <HeartIcon />
                    </ModalIconButton>
                    <ModalIconButton>
                      <MoreIcon />
                    </ModalIconButton>
                  </ModalActions>
                </ModalMusicInfo>
              </ModalHeader>

              {lyricsLoading && <Spinner />}

              {!lyricsLoading && lyricsData?.error && <ErrorText>{lyricsData.error}</ErrorText>}

              {!lyricsLoading && lyricsData?.lyrics && (
                <>
                  <TabRow>
                    <Tab $active={!showTranslation} onClick={() => setShowTranslation(false)}>
                      원문 가사
                    </Tab>
                    <Tab $active={showTranslation} onClick={() => setShowTranslation(true)}>
                      한국어 번역
                    </Tab>
                  </TabRow>
                  <LyricsContainer>
                    <LyricsText>
                      {showTranslation
                        ? (lyricsData.translated ?? "번역을 불러오지 못했습니다")
                        : lyricsData.lyrics}
                    </LyricsText>
                  </LyricsContainer>
                </>
              )}

              {!lyricsLoading && !lyricsData?.lyrics && !lyricsData?.error && (
                <StatusText>가사 정보가 없습니다</StatusText>
              )}
            </ModalContent>
          </Modal>
        </Overlay>
      )}

      {/* 나우 플레잉 바 */}
      {currentTrack && (
        <NowPlayingBar>
          <NowPlayingInfo>
            <NowPlayingThumb>
              {currentTrack.image && (
                <Image 
                  src={currentTrack.image} 
                  alt={currentTrack.title} 
                  width={48}
                  height={48}
                  style={{ objectFit: "cover" }} 
                />
              )}
            </NowPlayingThumb>
            <NowPlayingText>
              <NowPlayingTitle>{currentTrack.title}</NowPlayingTitle>
              <NowPlayingArtist>{currentTrack.artist}</NowPlayingArtist>
            </NowPlayingText>
          </NowPlayingInfo>
          
          <NowPlayingControls>
            <ControlButton>
              <SkipBackIcon />
            </ControlButton>
            <ControlButton $primary onClick={() => setIsPlaying(!isPlaying)}>
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </ControlButton>
            <ControlButton>
              <SkipForwardIcon />
            </ControlButton>
          </NowPlayingControls>
          
          <WaveContainer>
            {isPlaying && [0, 0.1, 0.2, 0.3, 0.4].map((delay, i) => (
              <WaveBar key={i} $delay={delay} />
            ))}
          </WaveContainer>
        </NowPlayingBar>
      )}
    </PageWrapper>
  );
}
