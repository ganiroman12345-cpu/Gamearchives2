import React, { useEffect, useRef } from 'react';
import { useGameStore } from '../store';
import { GameState } from '../types';

export const MusicSystem: React.FC = () => {
  const gameState = useGameStore(s => s.gameState);
  const gameMode = useGameStore(s => s.gameMode);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const stopAudioRef = useRef<HTMLAudioElement | null>(null);
  const currentTrackSrcRef = useRef<string | null>(null);
  const isPlayingRef = useRef<boolean>(false);
  const lastModeRef = useRef<string>('');

  const playTrack = (trackUrl: string, loop: boolean) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const audio = new Audio(trackUrl);
    audio.loop = loop;
    audio.volume = 0.55;
    audio.preload = 'auto';

    if (!loop) {
      audio.onended = () => {
        isPlayingRef.current = false;
        
        // Stop currently playing music & play the "Music Stop" sound effect
        if (stopAudioRef.current) {
          stopAudioRef.current.pause();
          stopAudioRef.current = null;
        }

        const stopAudio = new Audio('/audio/music_stop.mp3');
        stopAudio.volume = 0.85;
        stopAudioRef.current = stopAudio;

        const handleStopAudioEnd = () => {
          // Check if we are still in multiplayer mode/screens
          const curState = useGameStore.getState().gameState;
          const curMode = useGameStore.getState().gameMode;
          const stillMultiplayer = curMode === 'MULTIPLAYER' && (
            curState === GameState.CHARACTER_SELECT || 
            curState === GameState.MULTIPLAYER_LOBBY
          );

          if (stillMultiplayer) {
            // Cycle through Neon Highway, Cybernetic Circuits, and Unearthly Powers!
            const playlist = [
              '/audio/neon_highway.mp3',
              '/audio/cybernetic.mp3',
              '/audio/power.mp3'
            ];
            const currentIdx = playlist.findIndex(t => currentTrackSrcRef.current?.includes(t) || currentTrackSrcRef.current === t);
            const nextIdx = (currentIdx + 1) % playlist.length;
            const nextTrack = playlist[nextIdx >= 0 ? nextIdx : 0];

            currentTrackSrcRef.current = nextTrack;
            playTrack(nextTrack, false);
          }
        };

        stopAudio.onended = handleStopAudioEnd;
        stopAudio.onerror = handleStopAudioEnd;

        stopAudio.play().catch(() => {
          // If playback failed, proceed directly
          handleStopAudioEnd();
        });
      };
    }

    audioRef.current = audio;
    currentTrackSrcRef.current = trackUrl;

    audio.play().then(() => {
      isPlayingRef.current = true;
    }).catch(() => {
      isPlayingRef.current = false;
    });
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isMultiplayer = gameMode === 'MULTIPLAYER';
    const isMultiplayerScreen = isMultiplayer && (
      gameState === GameState.CHARACTER_SELECT || 
      gameState === GameState.MULTIPLAYER_LOBBY
    );
    const isStandardMenu = !isMultiplayer && (
      gameState === GameState.MENU || 
      gameState === GameState.CHARACTER_SELECT
    );

    const shouldPlay = isMultiplayerScreen || isStandardMenu;

    if (!shouldPlay) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }
      if (stopAudioRef.current) {
        stopAudioRef.current.pause();
        stopAudioRef.current = null;
      }
      isPlayingRef.current = false;
      currentTrackSrcRef.current = null;
      return;
    }

    if (isMultiplayerScreen) {
      // If already playing one of the multiplayer tracks (Neon Highway, Cybernetic, Power), keep it playing across screens
      if (
        currentTrackSrcRef.current && 
        (currentTrackSrcRef.current.includes('neon_highway') || currentTrackSrcRef.current.includes('cybernetic') || currentTrackSrcRef.current.includes('power')) &&
        lastModeRef.current === 'MULTIPLAYER' &&
        isPlayingRef.current
      ) {
        // Continue current track
      } else {
        const multiplayerTracks = ['/audio/neon_highway.mp3', '/audio/cybernetic.mp3', '/audio/power.mp3'];
        const selectedTrack = multiplayerTracks[Math.floor(Math.random() * multiplayerTracks.length)];
        playTrack(selectedTrack, false);
      }
    } else if (isStandardMenu) {
      if (currentTrackSrcRef.current !== '/audio/neon_highway.mp3') {
        playTrack('/audio/neon_highway.mp3', true);
      }
    }

    lastModeRef.current = gameMode;

    const handleUserInteraction = () => {
      const curState = useGameStore.getState().gameState;
      const curMode = useGameStore.getState().gameMode;
      const active = (curMode === 'MULTIPLAYER' && (curState === GameState.CHARACTER_SELECT || curState === GameState.MULTIPLAYER_LOBBY)) ||
                     (curMode !== 'MULTIPLAYER' && (curState === GameState.MENU || curState === GameState.CHARACTER_SELECT));

      if (active && audioRef.current && (audioRef.current.paused || !isPlayingRef.current)) {
        audioRef.current.play().then(() => {
          isPlayingRef.current = true;
        }).catch(() => {});
      }
    };

    window.addEventListener('click', handleUserInteraction);
    window.addEventListener('keydown', handleUserInteraction);
    window.addEventListener('touchstart', handleUserInteraction);

    return () => {
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
      window.removeEventListener('touchstart', handleUserInteraction);
    };
  }, [gameState, gameMode]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (stopAudioRef.current) {
        stopAudioRef.current.pause();
        stopAudioRef.current = null;
      }
    };
  }, []);

  return null;
};
