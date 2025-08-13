import React, { useState, useRef, useEffect, useCallback } from 'react';
import { wheelchairParts, wheelchairFeatures } from '../../constants/wheelchairParts';
import PartModal from '../../components/PartModal/PartModal';
import ImageViewer from '../../components/ImageViewer/ImageViewer';
import './Viewer.css';

const MODAL_TRANSITION_DELAY = 2000;

const Viewer = () => {
  // Modal & Tour State
  const [selectedPart, setSelectedPart] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState('front');
  const [hotspotIndex, setHotspotIndex] = useState(0);
  const [accessoryIndex, setAccessoryIndex] = useState(-1);
  const [postBackIndex, setPostBackIndex] = useState(-1);
  const [tourStage, setTourStage] = useState('waiting');
  const [isUserClickedModal, setIsUserClickedModal] = useState(false);

  // Refs
  const modalTimerRef = useRef(null);
  const accessoryTimerRef = useRef(null);
  const modalOpenTimerRef = useRef(null);
  const featuresGridRef = useRef(null);
  const hadBackHotspotsTour = useRef(false);

  const isSkippingRef = useRef(false);

  const postBackImages = [
    '/assets/images/Caterwil1.jpg',
    '/assets/images/Caterwil2.jpg',
    '/assets/images/Caterwil3.jpg',
    '/assets/images/Caterwil4.jpg',
    '/assets/images/Caterwil5.jpg',
  ];

  // Check if horizontal scrolling is needed for mobile/tablet
  const hasHorizontalScroll = useCallback(() => {
    if (!featuresGridRef.current) return false;
    const container = featuresGridRef.current;
    return container.scrollWidth > container.clientWidth;
  }, []);

  // Smooth horizontal scroll for mobile/tablet
  const smoothHorizontalScroll = useCallback(() => {
    return new Promise((resolve) => {
      if (!featuresGridRef.current || !hasHorizontalScroll()) {
        resolve();
        return;
      }

      const container = featuresGridRef.current;
      const maxScrollLeft = container.scrollWidth - container.clientWidth;
      
      if (maxScrollLeft <= 0) {
        resolve();
        return;
      }

      const duration = 4000; // 4 seconds for horizontal scroll
      let startTime = null;
      const startScrollLeft = container.scrollLeft;

      const animate = (time) => {
        if (!startTime) startTime = time;
        const elapsed = time - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function
        const ease = progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;

        container.scrollLeft = startScrollLeft + (maxScrollLeft - startScrollLeft) * ease;

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          // Wait a bit at the end, then resolve
          setTimeout(resolve, 1000);
        }
      };

      requestAnimationFrame(animate);
    });
  }, [hasHorizontalScroll]);

  // Smooth scroll and navigation after tour done
  const handleScrollAndNavigate = useCallback(async () => {
    const scrollDown = () =>
      new Promise((resolve) => {
        const startY = window.pageYOffset;
        const endY = document.body.scrollHeight - window.innerHeight;
        const distance = endY - startY;
        const duration = Math.min(7000, Math.max(3000, distance * 2.5));
        let startTime = null;

        const animate = (time) => {
          if (!startTime) startTime = time;
          const elapsed = time - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const ease =
            progress < 0.5
              ? 2 * progress * progress
              : 1 - Math.pow(-2 * progress + 2, 2) / 2;

          window.scrollTo(0, startY + distance * ease);

          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            resolve();
          }
        };
        requestAnimationFrame(animate);
      });

    const scrollUp = () =>
      new Promise((resolve) => {
        const startY = window.pageYOffset;
        const duration = 3000;
        let startTime = null;

        const animate = (time) => {
          if (!startTime) startTime = time;
          const elapsed = time - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const ease =
            progress < 0.5
              ? 2 * progress * progress
              : 1 - Math.pow(-2 * progress + 2, 2) / 2;

          window.scrollTo(0, startY * (1 - ease));

          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            resolve();
          }
        };
        requestAnimationFrame(animate);
      });

    // Wait a moment before starting
    await new Promise((r) => setTimeout(r, 1000));
    
    // 1. First scroll down to the bottom
    await scrollDown();
    
    // 2. Then check for horizontal scroll and handle it
    if (hasHorizontalScroll()) {
      await smoothHorizontalScroll();
      await new Promise((r) => setTimeout(r, 2000)); // Wait 2 seconds after horizontal scroll
    }
    
    // 3. Wait additional 6 seconds at the bottom (total viewing time)
    await new Promise((r) => setTimeout(r, 6000));
    
    // 4. Smooth scroll up back to the top
    await scrollUp();
    
    // 5. Wait a moment then navigate to home page
    await new Promise((r) => setTimeout(r, 1000));
    window.location.href = '/';
  }, [hasHorizontalScroll, smoothHorizontalScroll]);

  const slightScrollDown = useCallback(() => {
    return new Promise((resolve) => {
      const startY = window.pageYOffset;
      const maxScroll = document.body.scrollHeight - window.innerHeight;
      const targetY = Math.min(startY + 350, maxScroll);
      const duration = 1200;
      let startTime = null;

      const animate = (time) => {
        if (!startTime) startTime = time;
        const elapsed = time - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease =
          progress < 0.5
            ? 2 * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;

        window.scrollTo(0, startY + (targetY - startY) * ease);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };

      requestAnimationFrame(animate);
    });
  }, []);

  const estimateReadingTime = useCallback((text) => {
    const words = text ? text.trim().split(/\s+/).length : 20;
    return Math.min(Math.max(words * 300, 4000), 15000);
  }, []);

  const partsForView = React.useMemo(() => {
    return currentView === 'front'
      ? wheelchairParts.filter((p) => p.frontPosition)
      : wheelchairParts.filter((p) => p.backPosition);
  }, [currentView]);

  const handleVideoEnded = useCallback(() => {
    clearTimeout(modalTimerRef.current);

    setTimeout(() => {
      setSelectedPart(null);
      setIsModalOpen(false);
      setTimeout(() => {
        setHotspotIndex((i) => i + 1);
      }, MODAL_TRANSITION_DELAY);
    }, 500);
  }, []);

  const openModalForHotspot = useCallback(
    (index) => {
      if (index < 0 || index >= partsForView.length) {
        clearTimeout(modalTimerRef.current);
        setTimeout(() => {
          setSelectedPart(null);
          setIsModalOpen(false);
        }, 500);
        return;
      }

      clearTimeout(modalTimerRef.current);
      clearTimeout(modalOpenTimerRef.current);

      modalOpenTimerRef.current = setTimeout(() => {
        const part = partsForView[index];
        setSelectedPart({
          ...part,
          media:
            part.media || {
              type: 'image',
              src: '/assets/images/placeholder-part.jpg',
              poster: '/assets/images/placeholder-poster.jpg',
            },
          specs: part.specs || [],
          safetyNote: part.safetyNote || null,
        });
        setIsModalOpen(true);
        setIsUserClickedModal(true);

        if (part.media && part.media.type === 'video') {
          // Do not auto-close timer for videos
        } else {
          modalTimerRef.current = setTimeout(() => {
            setIsModalOpen(false);
            setTimeout(() => {
              setSelectedPart(null);
              setTimeout(() => {
                setHotspotIndex((i) => i + 1);
              }, MODAL_TRANSITION_DELAY);
            }, 500);
          }, Math.max(estimateReadingTime(part.description), 7000));
        }
      }, MODAL_TRANSITION_DELAY);
    },
    [partsForView, estimateReadingTime]
  );

  useEffect(() => {
    if (accessoryIndex === -1 || !featuresGridRef.current) return;
    if (tourStage === 'accessories') return;

    const container = featuresGridRef.current;
    const accessoryElements = container.children;
    if (accessoryIndex >= accessoryElements.length) return;

    const targetElement = accessoryElements[accessoryIndex];
    if (targetElement) {
      container.scrollTo({
        left: targetElement.offsetLeft - container.clientWidth / 2 + targetElement.clientWidth / 2,
        behavior: 'smooth',
      });
    }
  }, [accessoryIndex, tourStage]);

  useEffect(() => {
    if (tourStage === 'stopped') return;

    if (tourStage === 'waiting') {
      const timer = setTimeout(() => {
        setTourStage('frontHotspots');
        setCurrentView('front');
        setHotspotIndex(0);
      }, 6000);
      return () => clearTimeout(timer);
    }

    if (tourStage === 'frontHotspots') {
      if (hotspotIndex >= partsForView.length) {
        setTourStage('switchingToBack');
        setIsModalOpen(false);
        setSelectedPart(null);
        setTimeout(() => {
          setCurrentView('back');
          setHotspotIndex(0);
          setTourStage('backHotspots');
        }, 1500);
      } else {
        openModalForHotspot(hotspotIndex);
      }
    }

    if (tourStage === 'backHotspots') {
      if (hotspotIndex >= partsForView.length) {
        setIsModalOpen(false);
        setSelectedPart(null);

        slightScrollDown()
          .then(() => new Promise((r) => setTimeout(r, 3000)))
          .then(() => {
            hadBackHotspotsTour.current = true;
            setTourStage('postBackThumbnails');
            setPostBackIndex(0);
          });
      } else {
        openModalForHotspot(hotspotIndex);
      }
    }
  }, [
    tourStage,
    hotspotIndex,
    currentView,
    openModalForHotspot,
    partsForView.length,
    slightScrollDown,
  ]);

  // PostBack thumbnails with auto-advance after 5 seconds
  useEffect(() => {
    if (tourStage === 'stopped') return;
    if (tourStage !== 'postBackThumbnails' || postBackIndex === -1 || postBackIndex === null) return;

    if (postBackIndex >= postBackImages.length) {
      setTourStage('done');
      setPostBackIndex(-1);
      return;
    }

    const autoAdvanceTimer = setTimeout(() => {
      if (postBackIndex >= postBackImages.length - 1) {
        // If it's the last image, end the slideshow and continue tour
        setTourStage('done');
        setPostBackIndex(-1);
      } else {
        // Show next image
        setPostBackIndex((prev) => prev + 1);
      }
    }, 5000); // 5 seconds auto-advance

    return () => clearTimeout(autoAdvanceTimer);
  }, [postBackIndex, tourStage, postBackImages.length]);

  // Accessories slideshow
  useEffect(() => {
    if (tourStage === 'stopped') return;
    if (tourStage !== 'accessories' || accessoryIndex === -1) return;

    if (accessoryIndex >= wheelchairFeatures.length) {
      setTourStage('done');
      setAccessoryIndex(-1);
      return;
    }

    const timer = setTimeout(() => {
      setAccessoryIndex((i) => i + 1);
    }, 5000);

    accessoryTimerRef.current = timer;

    return () => clearTimeout(timer);
  }, [accessoryIndex, tourStage]);

  useEffect(() => {
    if (tourStage === 'done') {
      if (hadBackHotspotsTour.current || accessoryIndex === -1) {
        handleScrollAndNavigate();
      }
    }
  }, [tourStage, handleScrollAndNavigate, accessoryIndex]);

  const handleCloseModal = useCallback(() => {
    clearTimeout(modalTimerRef.current);
    setIsModalOpen(false);

    setTimeout(() => {
      setSelectedPart(null);
      setTimeout(() => {
        setHotspotIndex((i) => i + 1);
      }, MODAL_TRANSITION_DELAY);
    }, 500);

    setIsUserClickedModal(false);
  }, []);

  const handleSkip = useCallback(() => {
    isSkippingRef.current = true;

    setIsModalOpen(false);
    setSelectedPart(null);

    if (currentView === 'front' || currentView === 'back') {
      const nextIndex = hotspotIndex + 1;
      setTimeout(() => {
        setHotspotIndex(nextIndex);
        setTimeout(() => {
          isSkippingRef.current = false;
        }, 300);
      }, 100);
    } else {
      isSkippingRef.current = false;
    }

    setIsUserClickedModal(false);
  }, [currentView, hotspotIndex]);

  const handlePartClick = (part) => {
    if (tourStage === 'frontHotspots' || tourStage === 'backHotspots') return;

    setSelectedPart(part);
    setIsModalOpen(true);
    setIsUserClickedModal(true);
  };

  // Handle PostBack thumbnail close button - show next image or end slideshow
  const handlePostBackClose = useCallback(() => {
    if (postBackIndex >= postBackImages.length - 1) {
      // If it's the last image, end the slideshow and continue tour
      setTourStage('done');
      setPostBackIndex(-1);
    } else {
      // Show next image
      setPostBackIndex((prev) => prev + 1);
    }
  }, [postBackIndex, postBackImages.length]);

  useEffect(() => {
    if (
      (tourStage === 'frontHotspots' || tourStage === 'backHotspots') &&
      !isModalOpen &&
      hotspotIndex < partsForView.length
    ) {
      if (isSkippingRef.current) return;
      const part = partsForView[hotspotIndex];
      setSelectedPart({
        ...part,
        media:
          part.media || {
            type: 'image',
            src: '/assets/images/placeholder-part.jpg',
            poster: '/assets/images/placeholder-poster.jpg',
          },
        specs: part.specs || [],
        safetyNote: part.safetyNote || null,
      });
      setIsModalOpen(true);
      setIsUserClickedModal(true);
    }
  }, [hotspotIndex, tourStage, partsForView, isModalOpen]);

  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth <= 768 : false
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const featuresGridStyle = {
    whiteSpace: 'nowrap',
    overflowX: isMobile ? 'auto' : 'hidden',
  };

  const stopTour = useCallback(() => {
    clearTimeout(modalTimerRef.current);
    clearTimeout(accessoryTimerRef.current);

    setIsModalOpen(false);
    setSelectedPart(null);

    setTourStage('stopped');

    setHotspotIndex(0);
    setAccessoryIndex(-1);
    setPostBackIndex(-1);

    hadBackHotspotsTour.current = false;
    setIsUserClickedModal(false);
  }, []);

  const restartTour = useCallback(() => {
    setHotspotIndex(0);
    setAccessoryIndex(-1);
    setPostBackIndex(-1);
    setSelectedPart(null);
    setIsModalOpen(false);
    setTourStage('waiting');

    hadBackHotspotsTour.current = false;
    setIsUserClickedModal(false);
  }, []);

  return (
    <div className="viewer-page">
      <section className="viewer-section">
        <div className="section-header">
          <h2 className="section-title">Interactive Wheelchair Explorer</h2>
        </div>
        <p className="section-subtitle">Click on any highlighted part to learn more</p>

        <div className="viewer-container">
          <ImageViewer
            parts={wheelchairParts}
            onPartClick={handlePartClick}
            isModalOpen={isModalOpen}
            currentView={currentView}
            setCurrentView={setCurrentView}
          />
        </div>
      </section>

      <section className="features-section" style={featuresGridStyle}>
        <h2 className="section-title">Key Features</h2>
        <div className="features-grid" ref={featuresGridRef}>
          {wheelchairFeatures.map((feature, idx) => (
            <div
              key={idx}
              className={`feature-card ${
                tourStage === 'accessories' && accessoryIndex === idx ? 'active' : ''
              }`}
              style={{ display: 'inline-block', minWidth: 250, marginRight: 16 }}
            >
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {selectedPart && (
        <PartModal
          part={selectedPart}
          onClose={handleCloseModal}
          parts={wheelchairParts}
          setSelectedPart={setSelectedPart}
          onVideoEnded={handleVideoEnded}
          showSkipButton={isUserClickedModal}
          onSkip={handleSkip}
        />
      )}

      {tourStage === 'postBackThumbnails' &&
        postBackIndex !== null &&
        postBackIndex >= 0 &&
        postBackIndex < postBackImages.length && (
          <div className="postback-modal-overlay">
            <div className="postback-modal-content" style={{ position: 'relative' }}>
              <img
                src={postBackImages[postBackIndex]}
                alt={`Thumbnail ${postBackIndex + 1}`}
                draggable={false}
                style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain' }}
              />
              <button
                onClick={handlePostBackClose}
                style={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  background: 'rgba(0,0,0,0.5)',
                  border: 'none',
                  color: 'white',
                  fontSize: 20,
                  padding: '4px 8px',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  zIndex: 10000,
                }}
                aria-label="Close"
                title="Close"
              >
                ×
              </button>

              {/* Optional: Show image counter */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 10,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'rgba(0,0,0,0.7)',
                  color: 'white',
                  padding: '4px 12px',
                  borderRadius: '16px',
                  fontSize: '14px',
                }}
              >
                {postBackIndex + 1} / {postBackImages.length}
              </div>
            </div>
          </div>
        )}

      {/* Moved Stop and Restart buttons to render last */}
      <div className="tour-controls" style={{ marginTop: 20, textAlign: 'center' }}>
        <button
          onClick={stopTour}
          style={{
            marginRight: 10,
            padding: '6px 12px',
            fontSize: '1rem',
            cursor: tourStage === 'stopped' ? 'not-allowed' : 'pointer',
            opacity: tourStage === 'stopped' ? 0.6 : 1,
          }}
          disabled={tourStage === 'stopped'}
          title="Stop the automatic tour"
        >
          ■ Stop Tour
        </button>

        <button
          onClick={restartTour}
          style={{
            padding: '6px 12px',
            fontSize: '1rem',
            cursor: tourStage !== 'stopped' ? 'not-allowed' : 'pointer',
            opacity: tourStage !== 'stopped' ? 0.6 : 1,
          }}
          disabled={tourStage !== 'stopped'}
          title="Restart the tour from beginning"
        >
          🔄 Restart Tour
        </button>
      </div>
    </div>
  );
};

export default Viewer;
