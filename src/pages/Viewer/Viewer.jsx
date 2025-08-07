import React, { useState, useRef, useEffect, useCallback } from 'react';
import { wheelchairParts, wheelchairFeatures } from '../../constants/wheelchairParts';
import PartModal from '../../components/PartModal/PartModal';
import ImageViewer from '../../components/ImageViewer/ImageViewer';
import './Viewer.css';

// Define a constant for 4 seconds delay between modal close and next open
const MODAL_TRANSITION_DELAY = 2000;

const Viewer = () => {
  // Modal & Tour State
  const [selectedPart, setSelectedPart] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalVisible, setModalVisible] = useState(false); // For fade transitions

  // Current controlled view for ImageViewer
  const [currentView, setCurrentView] = useState('front');

  // Hotspot tour indexes for front and back views
  const [hotspotIndex, setHotspotIndex] = useState(0);

  // Accessories slideshow index (-1 means not started)
  const [accessoryIndex, setAccessoryIndex] = useState(-1);

  // PostBack thumbnails slideshow index (-1 means not started)
  const [postBackIndex, setPostBackIndex] = useState(-1);

  // Tour stages including stopped state
  const [tourStage, setTourStage] = useState('waiting');

  // Timer refs
  const modalTimerRef = useRef(null);
  const accessoryTimerRef = useRef(null);
  const modalOpenTimerRef = useRef(null);
  const featuresGridRef = useRef(null);

  // PostBack thumbnails images
  const postBackImages = [
    '/assets/images/Caterwil1.jpg',
    '/assets/images/Caterwil2.jpg',
    '/assets/images/Caterwil3.jpg',
    '/assets/images/Caterwil4.jpg',
    '/assets/images/Caterwil5.jpg',
  ];

  // Smooth scroll and navigate function
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

    await new Promise((r) => setTimeout(r, 1000));
    await scrollDown();
    await new Promise((r) => setTimeout(r, 9000));
    await scrollUp();
    await new Promise((r) => setTimeout(r, 1000));
    window.location.href = '/';
  }, []);

  // Estimate reading time calculation
  const estimateReadingTime = useCallback((text) => {
    const words = text ? text.trim().split(/\s+/).length : 20;
    return Math.min(Math.max(words * 300, 4000), 15000);
  }, []);

  // Filter parts for current view
  const partsForView = React.useMemo(() => {
    return currentView === 'front'
      ? wheelchairParts.filter((p) => p.frontPosition)
      : wheelchairParts.filter((p) => p.backPosition);
  }, [currentView]);

  // Callback for when video in modal ends - close modal and proceed to next
  const handleVideoEnded = useCallback(() => {
    setModalVisible(false); // start fade out
    clearTimeout(modalTimerRef.current);

    setTimeout(() => {
      setSelectedPart(null);
      setIsModalOpen(false);
      setTimeout(() => {
        setHotspotIndex((i) => i + 1);
      }, MODAL_TRANSITION_DELAY);
    }, 500); // fade out duration should match your CSS transition timing
  }, []);

  // Open modal for hotspot with fade transitions and delay
  const openModalForHotspot = useCallback(
    (index) => {
      if (index < 0 || index >= partsForView.length) {
        setModalVisible(false);
        clearTimeout(modalTimerRef.current);
        setTimeout(() => {
          setSelectedPart(null);
          setIsModalOpen(false);
        }, 500);
        return;
      }

      setModalVisible(false);
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

        setTimeout(() => {
          setModalVisible(true);
        }, 100);

        if (part.media && part.media.type === 'video') {
          // Wait for video end, no auto close timer
        } else {
          modalTimerRef.current = setTimeout(() => {
            setModalVisible(false);
            setTimeout(() => {
              setSelectedPart(null);
              setIsModalOpen(false);
              setTimeout(() => {
                setHotspotIndex((i) => i + 1);
              }, MODAL_TRANSITION_DELAY);
            }, 500);
          }, Math.max(estimateReadingTime(part.description), 7000));
        }
      }, MODAL_TRANSITION_DELAY); // delay before opening modal
    },
    [partsForView, estimateReadingTime]
  );

  // Scroll accessories grid to center active item
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

  // Main tour effect with stop check
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
        setTourStage('postBackThumbnails');
        setIsModalOpen(false);
        setSelectedPart(null);
        setPostBackIndex(0);
      } else {
        openModalForHotspot(hotspotIndex);
      }
    }
  }, [tourStage, hotspotIndex, currentView, openModalForHotspot, partsForView.length]);

  // PostBack thumbnail slideshow
  useEffect(() => {
    if (tourStage === 'stopped') return;
    if (tourStage !== 'postBackThumbnails' || postBackIndex === -1) return;

    if (postBackIndex >= postBackImages.length) {
      setTourStage('done');
      setPostBackIndex(-1);
      handleScrollAndNavigate();
      return;
    }

    const timer = setTimeout(() => {
      setPostBackIndex((i) => i + 1);
    }, 5000);

    return () => clearTimeout(timer);
  }, [postBackIndex, tourStage, handleScrollAndNavigate, postBackImages.length]);

  // Accessories slideshow effect
  useEffect(() => {
    if (tourStage === 'stopped') return;
    if (tourStage !== 'accessories' || accessoryIndex === -1) return;

    if (accessoryIndex >= wheelchairFeatures.length) {
      setTourStage('done');
      setAccessoryIndex(-1);
      handleScrollAndNavigate();
      return;
    }

    accessoryTimerRef.current = setTimeout(() => {
      setAccessoryIndex((i) => i + 1);
    }, 5000);

    return () => clearTimeout(accessoryTimerRef.current);
  }, [accessoryIndex, tourStage, handleScrollAndNavigate]);

  // Manual modal close handler
  const handleCloseModal = useCallback(() => {
    clearTimeout(modalTimerRef.current);

    setModalVisible(false);

    setTimeout(() => {
      setSelectedPart(null);
      setIsModalOpen(false);

      setTimeout(() => {
        setHotspotIndex((i) => i + 1);
      }, MODAL_TRANSITION_DELAY);
    }, 500);
  }, []);

  // Responsive mobile detection for horizontal scroll
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

  // Stop and restart tour handlers
  const stopTour = useCallback(() => {
    clearTimeout(modalTimerRef.current);
    clearTimeout(accessoryTimerRef.current);

    setIsModalOpen(false);
    setSelectedPart(null);

    setTourStage('stopped');

    setHotspotIndex(0);
    setAccessoryIndex(-1);
    setPostBackIndex(-1);
  }, []);

  const restartTour = useCallback(() => {
    setHotspotIndex(0);
    setAccessoryIndex(-1);
    setPostBackIndex(-1);
    setSelectedPart(null);
    setIsModalOpen(false);
    setTourStage('waiting');
  }, []);

  return (
    <div className="viewer-page">
      {/* Tour control buttons */}
      <div className="tour-controls" style={{ marginBottom: 20, textAlign: 'center' }}>
        <button
          onClick={stopTour}
          style={{ marginRight: 10, padding: '8px 16px', fontSize: '1rem', cursor: 'pointer' }}
          disabled={tourStage === 'stopped'}
          title="Stop the automatic tour"
        >
          Stop Tour
        </button>
        <button
          onClick={restartTour}
          style={{ padding: '8px 16px', fontSize: '1rem', cursor: 'pointer' }}
          disabled={tourStage !== 'stopped'}
          title="Restart the tour from beginning"
        >
          Restart Tour
        </button>
      </div>

      <section className="viewer-section">
        <div className="section-header">
          <h2 className="section-title">Interactive Wheelchair Explorer</h2>
        </div>
        <p className="section-subtitle">Click on any highlighted part to learn more</p>

        <div className="viewer-container">
          <ImageViewer
            parts={wheelchairParts}
            onPartClick={(part) => {
              if (tourStage === 'frontHotspots' || tourStage === 'backHotspots') return;
              setSelectedPart(part);
              setIsModalOpen(true);
            }}
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
          onVideoEnded={handleVideoEnded} // Pass video ended handler here
        />
      )}

      {/* PostBack thumbnails modal */}
    {tourStage === 'postBackThumbnails' &&
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
          onClick={() => {
            // Close modal, stop slideshow, move tourStage to done or another final stage
            setTourStage('done');
            setPostBackIndex(-1);
          }}
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
          aria-label="Close slideshow"
          title="Close slideshow"
        >
          ×
        </button>
      </div>
    </div>
  )}

    </div>
  );
};

export default Viewer;
