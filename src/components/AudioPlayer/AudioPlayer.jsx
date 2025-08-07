// src/components/AudioPlayer/AudioPlayer.js
import React, { useState, useEffect, useRef } from 'react';
import backgroundMusic from '../../assets/audio/background-music.mp3'; // Updated import path
import { FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import './AudioPlayer.css';

const AudioPlayer = () => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Initialize audio settings
  useEffect(() => {
    audioRef.current = new Audio(backgroundMusic);
    const audio = audioRef.current;
    audio.loop = true;
    audio.volume = 0.3; // 30% volume

    // Cleanup on unmount
    return () => {
      audio.pause();
      // Removed the undefined handleEnded reference
      if (audioRef.current) {
        audioRef.current.src = ''; // Clean up audio object
      }
    };
  }, []);

  // Handle first user interaction
  useEffect(() => {
    const handleFirstInteraction = () => {
      setHasInteracted(true);
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };

    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('keydown', handleFirstInteraction);

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };
  }, []);

  // Handle play/pause when hasInteracted changes
  useEffect(() => {
    if (hasInteracted && isPlaying) {
      audioRef.current.play().catch(error => {
        console.error("Audio playback failed:", error);
      });
    }
  }, [hasInteracted, isPlaying]);

  const togglePlay = () => {
    if (!hasInteracted) return;
    
    const audio = audioRef.current;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(error => {
        console.error("Audio playback failed:", error);
      });
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div 
      className={`audio-player ${!hasInteracted ? 'audio-player--disabled' : ''}`}
      onClick={togglePlay}
      title={isPlaying ? "Mute background music" : "Unmute background music"}
    >
      {isPlaying ? (
        <FaVolumeUp className="audio-icon" />
      ) : (
        <FaVolumeMute className="audio-icon" />
      )}
    </div>
  );
};

export default AudioPlayer;