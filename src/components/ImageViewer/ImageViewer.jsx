import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import './ImageViewer.css';

const ImageViewer = ({
  parts,
  onPartClick,
  isModalOpen,
  currentView: controlledCurrentView,
  setCurrentView: controlledSetCurrentView,
}) => {
  const [internalView, setInternalView] = useState('front');
  const [, setRotatingView] = useState(null);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [imageDimensions, setImageDimensions] = useState({
    naturalWidth: 0,
    naturalHeight: 0,
    displayedWidth: 0,
    displayedHeight: 0,
    containerWidth: 0,
    containerHeight: 0,
    offsetX: 0,
    offsetY: 0,
    scaleFactor: 1,
  });
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [touchStartX, setTouchStartX] = useState(null);
  const [currentFullscreenIndex, setCurrentFullscreenIndex] = useState(0);

  const imgContainerRef = useRef(null);
  const imgRef = useRef(null);
  const currentImgRef = useRef(null);
  const fullscreenImageRef = useRef(null);

  // Controlled or internal currentView and setter
  const currentView = controlledCurrentView ?? internalView;
  const setCurrentView = controlledSetCurrentView ?? setInternalView;

  const thumbnails = [
    { id: 1, src: "/assets/images/Caterwil2.jpg", alt: "Wheelchair accessory 1" },
    { id: 2, src: "/assets/images/Caterwil1.jpg", alt: "Wheelchair accessory 2" },
    { id: 3, src: "/assets/images/Caterwil4.jpg", alt: "Wheelchair accessory 3" },
    { id: 4, src: "/assets/images/Caterwil3.jpg", alt: "Wheelchair accessory 4" },
    { id: 5, src: "/assets/images/Caterwil5.jpg", alt: "Wheelchair accessory 5" },
  ];

  const updateImageDimensions = () => {
    if (currentImgRef.current && imgContainerRef.current) {
      const { naturalWidth, naturalHeight } = currentImgRef.current;

      if (naturalWidth > 0 && naturalHeight > 0) {
        const containerRect = imgContainerRef.current.getBoundingClientRect();
        const imageRect = currentImgRef.current.getBoundingClientRect();

        const containerAspect = containerRect.width / containerRect.height;
        const imageAspect = naturalWidth / naturalHeight;

        let scaleFactor, offsetX, offsetY;

        if (containerAspect > imageAspect) {
          scaleFactor = containerRect.height / naturalHeight;
          offsetX = (containerRect.width - (naturalWidth * scaleFactor)) / 2;
          offsetY = 0;
        } else {
          scaleFactor = containerRect.width / naturalWidth;
          offsetX = 0;
          offsetY = (containerRect.height - (naturalHeight * scaleFactor)) / 2;
        }

        setImageDimensions({
          naturalWidth,
          naturalHeight,
          displayedWidth: imageRect.width,
          displayedHeight: imageRect.height,
          containerWidth: containerRect.width,
          containerHeight: containerRect.height,
          offsetX,
          offsetY,
          scaleFactor,
        });
        setIsImageLoaded(true);
      }
    }
  };

  useEffect(() => {
    const resizeObserver = new ResizeObserver(updateImageDimensions);
    if (imgContainerRef.current) {
      resizeObserver.observe(imgContainerRef.current);
    }

    window.addEventListener('resize', updateImageDimensions);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateImageDimensions);
    };
  }, [currentView]);

  useEffect(() => {
    setRotatingView(currentView);
    const initialTimer = setTimeout(() => setRotatingView(null), 200);
    return () => clearTimeout(initialTimer);
  }, [currentView]);

  const handlePartClick = (part, e) => {
    e.stopPropagation();
    if (!isModalOpen) {
      onPartClick(part);
    }
  };

  const handleThumbnailClick = (imageSrc) => {
    const index = thumbnails.findIndex(thumb => thumb.src === imageSrc);
    setCurrentFullscreenIndex(index >= 0 ? index : 0);
    setFullscreenImage(imageSrc);
  };

  const closeFullscreen = () => {
    setFullscreenImage(null);
  };

  const navigateFullscreen = (direction) => {
    let newIndex;
    if (direction === 'prev') {
      newIndex = (currentFullscreenIndex - 1 + thumbnails.length) % thumbnails.length;
    } else {
      newIndex = (currentFullscreenIndex + 1) % thumbnails.length;
    }
    setCurrentFullscreenIndex(newIndex);
    setFullscreenImage(thumbnails[newIndex].src);
  };

  const handleFullscreenTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleFullscreenTouchMove = (e) => {
    if (!touchStartX) return;
    const touchEndX = e.touches[0].clientX;
    const difference = touchStartX - touchEndX;
    if (Math.abs(difference) > 50) {
      if (difference > 0) {
        navigateFullscreen('next');
      } else {
        navigateFullscreen('prev');
      }
      setTouchStartX(null);
    }
  };

  const handleFullscreenTouchEnd = () => {
    setTouchStartX(null);
  };

  const calculateHotspotPosition = (position) => {
    if (!position || !imageDimensions.naturalWidth) return { left: '0%', top: '0%' };
    const { x, y } = position;
    return {
      left: `${x}%`,
      top: `${y}%`,
    };
  };

  return (
    <div className={`image-viewer-wrapper ${fullscreenImage ? 'fullscreen-modal-open' : ''} ${isModalOpen ? 'modal-active' : ''}`}>
      <div className="viewer-container">
        <div className="image-viewer">
          <div className="view-selector">
            <button
              className={`view-button ${currentView === 'front' ? 'active' : ''}`}
              onClick={() => {
                setCurrentView('front');
              }}
            >
              Front View
            </button>
            <button
              className={`view-button ${currentView === 'back' ? 'active' : ''}`}
              onClick={() => {
                setCurrentView('back');
              }}
            >
              Back View
            </button>
          </div>

          <div
            ref={imgContainerRef}
            className="wheelchair-image-container"
            style={{ position: 'relative' }} // needed for absolute hotspots positioning
          >
            {/* motion.div animating scale continuously */}
            <motion.div
              className="image-wrapper"
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 5, repeat: Infinity, repeatType: 'loop', ease: 'easeInOut' }}
              style={{ position: 'relative', width: '100%', height: '100%' }}
            >
              <img
                ref={(node) => {
                  imgRef.current = node;
                  currentImgRef.current = node;
                }}
                src={currentView === 'front' ? "/assets/images/front.jpg" : "/assets/images/back.jpg"}
                alt={`Wheelchair ${currentView} view`}
                className="wheelchair-image"
                onLoad={updateImageDimensions}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/assets/images/placeholder.jpg";
                }}
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                }}
              />

              {isImageLoaded && parts.map(part => {
                const position = currentView === 'front' ? part.frontPosition : part.backPosition;
                if (!position) return null;
                const pos = calculateHotspotPosition(position);

                return (
                  <div
                    key={`${part.id}-${currentView}`}
                    className="hotspot"
                    style={{
                      position: 'absolute',
                      left: pos.left,
                      top: pos.top,
                      transform: 'translate(-50%, -50%)',
                      cursor: 'pointer',
                      zIndex: 10,
                    }}
                    onClick={(e) => handlePartClick(part, e)}
                  >
                    <div className="hotspot-marker"></div>
                    <div className="hotspot-tooltip">{part.name}</div>
                  </div>
                );
              })}
            </motion.div>
          </div>

          <div className="thumbnail-row-section">
            <h3 className="thumbnail-title">Accessories</h3>
            <div className="thumbnail-row-container">
              {thumbnails.map((thumbnail) => (
                <div
                  key={thumbnail.id}
                  className="thumbnail-item"
                  onClick={() => handleThumbnailClick(thumbnail.src)}
                >
                  <img
                    src={thumbnail.src}
                    alt={thumbnail.alt}
                    className="thumbnail-image"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/assets/images/placeholder-thumbnail.jpg";
                    }}
                  />
                  <div className="thumbnail-overlay">
                    <span className="view-text">View</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {fullscreenImage && (
        <div className="fullscreen-modal" onClick={closeFullscreen}>
          <div
            className="fullscreen-content"
            onClick={e => e.stopPropagation()}
            onTouchStart={handleFullscreenTouchStart}
            onTouchMove={handleFullscreenTouchMove}
            onTouchEnd={handleFullscreenTouchEnd}
          >
            <button
              className="nav-button prev-button"
              onClick={e => {
                e.stopPropagation();
                navigateFullscreen('prev');
              }}
            >
              &lt;
            </button>

            <img
              ref={fullscreenImageRef}
              src={fullscreenImage}
              alt="Fullscreen view"
              className="fullscreen-image"
            />

            <button
              className="nav-button next-button"
              onClick={e => {
                e.stopPropagation();
                navigateFullscreen('next');
              }}
            >
              &gt;
            </button>

            <div className="image-counter">
              {currentFullscreenIndex + 1} / {thumbnails.length}
            </div>

            <button className="close-button" onClick={closeFullscreen}>
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

ImageViewer.propTypes = {
  parts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string,
      frontPosition: PropTypes.shape({
        x: PropTypes.number,
        y: PropTypes.number,
      }),
      backPosition: PropTypes.shape({
        x: PropTypes.number,
        y: PropTypes.number,
      }),
    })
  ).isRequired,
  onPartClick: PropTypes.func.isRequired,
  isModalOpen: PropTypes.bool,
  currentView: PropTypes.oneOf(['front', 'back']),
  setCurrentView: PropTypes.func,
};

ImageViewer.defaultProps = {
  isModalOpen: false,
  currentView: undefined,
  setCurrentView: undefined,
};

export default ImageViewer;
