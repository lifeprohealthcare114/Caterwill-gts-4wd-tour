import React, { useState, useRef, useEffect, useCallback } from 'react';
import { wheelchairParts, wheelchairFeatures } from '../../constants/wheelchairParts';
import PartModal from '../../components/PartModal/PartModal';
import ImageViewer from '../../components/ImageViewer/ImageViewer';
import './Viewer.css';

const Viewer = () => {
  // Modal & Tour State
  const [selectedPart, setSelectedPart] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Current controlled view for ImageViewer
  const [currentView, setCurrentView] = useState('front');

  // Hotspot tour indexes for front and back views
  const [hotspotIndex, setHotspotIndex] = useState(0);

  // Accessories slideshow index (-1 means not started)
  const [accessoryIndex, setAccessoryIndex] = useState(-1);

  // PostBack thumbnails slideshow index (-1 means not started)
  const [postBackIndex, setPostBackIndex] = useState(-1);

  // Tour stages: waiting → frontHotspots → backHotspots → postBackThumbnails → accessories → done
  const [tourStage, setTourStage] = useState('waiting');

  // Timers refs
  const modalTimerRef = useRef(null);
  const accessoryTimerRef = useRef(null);
  const featuresGridRef = useRef(null);

  // Paths for postBack full screen slideshow images (replace with actual paths)
  const postBackImages = [
    '/assets/images/Caterwil1.jpg',
    '/assets/images/Caterwil2.jpg',
    '/assets/images/Caterwil3.jpg',
    '/assets/images/Caterwil4.jpg',
    '/assets/images/Caterwil5.jpg',
  ];

  // Smooth scroll down → wait 9 seconds → scroll up → navigate home
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

  // Function to estimate modal reading time
  const estimateReadingTime = useCallback((text) => {
    const words = text ? text.trim().split(/\s+/).length : 20;
    return Math.min(Math.max(words * 300, 4000), 15000); // Between 4s and 15s
  }, []);

  // Filter parts depending on currentView
  const partsForView = React.useMemo(() => {
    return currentView === 'front'
      ? wheelchairParts.filter((p) => p.frontPosition)
      : wheelchairParts.filter((p) => p.backPosition);
  }, [currentView]);

  // Memoized function to open modal for hotspot index with auto-close timer
  const openModalForHotspot = useCallback(
    (index) => {
      if (index < 0 || index >= partsForView.length) {
        setSelectedPart(null);
        setIsModalOpen(false);
        return;
      }

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

      const readTime = estimateReadingTime(part.description);

      clearTimeout(modalTimerRef.current);
      modalTimerRef.current = setTimeout(() => {
        setIsModalOpen(false);
        setSelectedPart(null);
        setTimeout(() => {
          setHotspotIndex((i) => i + 1);
        }, 500);
      }, readTime);
    },
    [partsForView, estimateReadingTime]
  );

  // Scroll accessories grid to center active item, only when NOT in auto slideshow tour stage
  useEffect(() => {
    if (accessoryIndex === -1 || !featuresGridRef.current) return;
    if (tourStage === 'accessories') return; // Disable auto scroll during tour accessories slideshow

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

  // Main effect manages tour stage transitions & modals for hotspots
  useEffect(() => {
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

  // PostBack Thumbnails slideshow effect: show one image fullscreen at a time
  useEffect(() => {
    if (tourStage !== 'postBackThumbnails' || postBackIndex === -1) return;

    if (postBackIndex >= postBackImages.length) {
      // After slideshow finished, trigger scroll and navigate home
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
    setIsModalOpen(false);
    setSelectedPart(null);

    if (tourStage === 'frontHotspots' || tourStage === 'backHotspots') {
      setHotspotIndex((i) => i + 1);
    }
  }, [tourStage]);

  // Responsive: Detect mobile for horizontal scroll styling
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth <= 768 : false
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Features grid scroll style (enable horizontal scrolling only on mobile)
  const featuresGridStyle = {
    whiteSpace: 'nowrap',
    overflowX: isMobile ? 'auto' : 'hidden',
  };

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
            onPartClick={(part) => {
              if (tourStage === 'frontHotspots' || tourStage === 'backHotspots') {
                // Disable manual clicks during hotspot tour
                return;
              }
              setSelectedPart(part);
              setIsModalOpen(true);
            }}
            isModalOpen={isModalOpen}
            currentView={currentView}
            setCurrentView={setCurrentView}
          />
        </div>
      </section>

      <section className="features-section">
        <h2 className="section-title">Key Features</h2>
        <div className="features-grid" ref={featuresGridRef} style={featuresGridStyle}>
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
        />
      )}

      {/* Fullscreen postBackThumbnails slideshow */}
      {tourStage === 'postBackThumbnails' &&
 postBackIndex >= 0 &&
 postBackIndex < postBackImages.length && (
   <div className="postback-modal-overlay">
     <div className="postback-modal-content">
       <img
         src={postBackImages[postBackIndex]}
         alt={`Thumbnail ${postBackIndex + 1}`}
         draggable={false}
       />
     </div>
   </div>
 )}

    </div>
  );
};

export default Viewer;
