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
            // Randomly choose between Unearthly Powers and Cybernetic Circuits!
            const playlist = [
              '/Cybernetic_Circuits.mp3',
              '/Unearthly_Powers.mp3'
            ];
            const nextTrack = playlist[Math.floor(Math.random() * playlist.length)];

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
      // If already playing one of the multiplayer tracks (Cybernetic, Power), keep it playing across screens
      if (
        currentTrackSrcRef.current && 
        (currentTrackSrcRef.current.toLowerCase().includes('cybernetic') || currentTrackSrcRef.current.toLowerCase().includes('power')) &&
        lastModeRef.current === 'MULTIPLAYER' &&
        isPlayingRef.current
      ) {
        // Continue current track
      } else {
        const multiplayerTracks = ['/Cybernetic_Circuits.mp3', '/Unearthly_Powers.mp3'];
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
