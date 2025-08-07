import React, { useRef, useEffect, useState, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Info, AlertTriangle } from 'lucide-react';
import './PartModal.css';

const PartModal = ({ 
  part, 
  onClose, 
  parts, 
  setSelectedPart
}) => {
  const videoRef = useRef(null);
  const playPromiseRef = useRef(null);
  const [currentPartIndex, setCurrentPartIndex] = useState(
    parts.findIndex(p => p.id === part.id)
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSpecs, setShowSpecs] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const media = part.media || {
    type: 'image',
    src: '/assets/images/placeholder-part.jpg',
    poster: '/assets/images/placeholder-poster.jpg'
  };

  const safePlay = useCallback(() => {
    if (!videoRef.current) return Promise.resolve();
    
    if (playPromiseRef.current) {
      playPromiseRef.current.catch(() => {});
    }
    
    const playPromise = videoRef.current.play();
    playPromiseRef.current = playPromise;
    
    return playPromise
      .then(() => {
        if (playPromiseRef.current === playPromise) {
          setIsPlaying(true);
          playPromiseRef.current = null;
        }
      })
      .catch(error => {
        if (playPromiseRef.current === playPromise) {
          console.log('Play failed:', error);
          setIsPlaying(false);
          playPromiseRef.current = null;
        }
      });
  }, []);

  const safePause = useCallback(() => {
    if (!videoRef.current) return;
    
    if (playPromiseRef.current) {
      playPromiseRef.current.catch(() => {});
      playPromiseRef.current = null;
    }
    
    videoRef.current.pause();
    setIsPlaying(false);
  }, []);

  const togglePlayback = useCallback(() => {
    if (!videoRef.current) return;
    
    setUserInteracted(true);
    
    if (!isPlaying) {
      safePlay();
    } else {
      safePause();
    }
  }, [isPlaying, safePlay, safePause]);

  const navigateParts = useCallback(async (direction) => {
    if (videoRef.current && media.type === 'video') {
      await safePause();
      setIsLoading(true);
    }
    
    let newIndex = currentPartIndex + direction;
    if (newIndex < 0) newIndex = parts.length - 1;
    if (newIndex >= parts.length) newIndex = 0;
    setCurrentPartIndex(newIndex);
    setSelectedPart(parts[newIndex]);
    setUserInteracted(false);
  }, [currentPartIndex, parts, setSelectedPart, media.type, safePause]);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || media.type !== 'video') return;

    videoElement.muted = true;
    videoElement.playsInline = true;
    videoElement.preload = 'auto';

    const handleLoadedData = () => {
      setIsLoading(false);
      if (!userInteracted) {
        safePlay().catch(() => {});
      }
    };

    videoElement.addEventListener('loadeddata', handleLoadedData);
    
    let timeoutId = setTimeout(() => {
      if (videoElement.readyState < 3) {
        setIsLoading(true);
      }
    }, 300);

    return () => {
      clearTimeout(timeoutId);
      videoElement.removeEventListener('loadeddata', handleLoadedData);
      if (playPromiseRef.current) {
        playPromiseRef.current.catch(() => {});
        playPromiseRef.current = null;
      }
    };
  }, [currentPartIndex, media.type, userInteracted, safePlay]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') navigateParts(-1);
      if (e.key === 'ArrowRight') navigateParts(1);
      if (e.key === 'Escape') onClose();
      if (e.key === ' ') {
        e.preventDefault();
        togglePlayback();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigateParts, onClose, togglePlayback]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>
          <X size={24} />
        </button>
        
        <div className="modal-header">
          <button 
            className="nav-button prev" 
            onClick={(e) => {
              e.stopPropagation();
              navigateParts(-1);
            }}
            aria-label="Previous part"
          >
            <ChevronLeft size={24} />
          </button>
          
          <div className="part-title-container">
            <h2 className="part-title">
              <span className="part-icon">{part.icon}</span>
              {part.name}
            </h2>
            <div className="part-controls">
              <button 
                className="specs-toggle"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSpecs(!showSpecs);
                }}
              >
                <Info size={18} />
                <span>{showSpecs ? 'Hide' : 'Show'} Specs</span>
              </button>
            </div>
          </div>
          
          <button 
            className="nav-button next" 
            onClick={(e) => {
              e.stopPropagation();
              navigateParts(1);
            }}
            aria-label="Next part"
          >
            <ChevronRight size={24} />
          </button>
        </div>
        
        <div className="modal-body">
          <div className={`media-container ${!part.safetyNote ? 'no-safety-note' : ''}`}>
            {media.type === 'video' ? (
              <div className="video-wrapper">
                {isLoading && (
                  <div className="video-loader">
                    <div className="loader-chair">
                      <div className="seat"></div>
                      <div className="back"></div>
                      <div className="leg front-left"></div>
                      <div className="leg front-right"></div>
                      <div className="leg back-left"></div>
                      <div className="leg back-right"></div>
                    </div>
                    <p>Loading video...</p>
                  </div>
                )}
                <video
                  ref={videoRef}
                  controls={false}
                  muted
                  playsInline
                  loop
                  poster={media.poster}
                  className={`part-media ${isLoading ? 'loading' : ''}`}
                  onClick={togglePlayback}
                >
                  <source src={media.src} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <button 
                  className={`play-button ${isPlaying ? 'playing' : ''} ${isLoading ? 'hidden' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePlayback();
                  }}
                >
                  {isPlaying ? '❚❚' : '▶'}
                </button>
              </div>
            ) : (
              <img 
                src={media.src} 
                alt={part.name} 
                className="part-media"
                onError={(e) => {
                  e.target.src = '/assets/images/placeholder-part.jpg';
                }}
              />
            )}
            
            {part.safetyNote && (
              <div className="safety-section">
                <h3 className="detail-title">
                  <AlertTriangle size={18} />
                  Safety Information
                </h3>
                <p className="detail-text">{part.safetyNote}</p>
              </div>
            )}
          </div>
          
          <div className="part-details">
            {showSpecs && part.specs && (
              <div className="specs-section">
                <h3 className="detail-title">Technical Specifications</h3>
                <ul className="specs-list">
                  {part.specs.map((spec, index) => (
                    <li key={index}>
                      <strong>{spec.name}:</strong> {spec.value}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="detail-section">
              <h3 className="detail-title">Description</h3>
              <p className="detail-text">{part.description}</p>
            </div>
            
            <div className="detail-section">
              <h3 className="detail-title">How It Works</h3>
              <p className="detail-text">{part.howItWorks}</p>
            </div>
          </div>
        </div>
        
        <div className="modal-footer">
          <button 
            className="close-modal-button" 
            onClick={onClose}
          >
            Return to Explorer
          </button>
        </div>
      </div>
    </div>
  );
};

export default PartModal; 