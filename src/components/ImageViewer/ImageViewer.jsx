import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import './ImageViewer.css';

const ImageViewer = ({
  parts,
  onPartClick,
  isModalOpen,
  currentView: controlledCurrentView,
  setCurrentView: controlledSetCurrentView,
}) => {
  const [internalView, setInternalView] = useState('front');
  const [isZooming, setIsZooming] = useState(false);
  const [rotatingView, setRotatingView] = useState(null);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);
  const [imageDimensions, setImageDimensions] = useState({
    naturalWidth: 0,
    naturalHeight: 0,
    displayedWidth: 0,
    displayedHeight: 0,
    containerWidth: 0,
    containerHeight: 0,
    offsetX: 0,
    offsetY: 0,
    scaleFactor: 1
  });
  const [touchStart, setTouchStart] = useState(null);
  const [touchPosition, setTouchPosition] = useState({ x: 0, y: 0 });
  const [initialDistance, setInitialDistance] = useState(null);
  const [initialScale, setInitialScale] = useState(1);
  const [lastTap, setLastTap] = useState(0);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [touchStartX, setTouchStartX] = useState(null);
  const [currentFullscreenIndex, setCurrentFullscreenIndex] = useState(0);

  const imgContainerRef = useRef(null);
  const imgRef = useRef(null);
  const currentImgRef = useRef(null);
  const fullscreenImageRef = useRef(null);
  const hasDimensions = useRef(false);

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
          scaleFactor
        });
        hasDimensions.current = true;
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
    hasDimensions.current = false;
    setIsImageLoaded(false);
  }, [currentView]);

  useEffect(() => {
    setRotatingView(currentView);
    const initialTimer = setTimeout(() => setRotatingView(null), 200);

    let interval;
    if (!isZoomed) {
      interval = setInterval(() => {
        setIsZooming(true);
        setTimeout(() => setIsZooming(false), 6000);
      }, 8000);
    }

    return () => {
      clearInterval(interval);
      clearTimeout(initialTimer);
    };
  }, [currentView, isZoomed]);

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

  const handleImageClick = (e) => {
    if (e.target.closest('.hotspot')) {
      return;
    }

    if (isModalOpen || fullscreenImage) return;

    if ('ontouchstart' in window || navigator.maxTouchPoints) {
      setIsZoomed(!isZoomed);
      if (!isZoomed) {
        setZoomPosition({ x: 50, y: 50 });
        setZoomScale(2);
      }
      return;
    }

    if (!isZoomed && imgContainerRef.current) {
      const container = imgContainerRef.current;
      const { left, top, width, height } = container.getBoundingClientRect();
      const x = ((e.clientX - left) / width) * 100;
      const y = ((e.clientY - top) / height) * 100;

      setZoomPosition({ x, y });
      setIsZoomed(true);
      setZoomScale(2);
      setIsZooming(false);
    } else {
      setIsZoomed(false);
      setZoomScale(1);
    }
  };

  const handleMouseMove = (e) => {
    if (!isZoomed || isModalOpen || fullscreenImage || !imgContainerRef.current) return;

    const container = imgContainerRef.current;
    const { left, top, width, height } = container.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;

    setZoomPosition({ x, y });
  };

  const handleTouchStart = (e) => {
    if (!isZoomed || isModalOpen || fullscreenImage) return;

    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTap;

    if (tapLength < 300 && tapLength > 0) {
      setZoomPosition({ x: 50, y: 50 });
      setIsZoomed(!isZoomed);
      if (!isZoomed) {
        setZoomScale(2);
      }
      e.preventDefault();
      return;
    }

    setLastTap(currentTime);

    if (e.touches.length === 1) {
      setTouchStart({
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      });
    }
  };

  const handleTouchMove = (e) => {
    if (!isZoomed || isModalOpen || fullscreenImage || !touchStart || !imgContainerRef.current) return;

    e.preventDefault();

    if (e.touches.length === 2) {
      handlePinch(e);
      return;
    }

    const container = imgContainerRef.current;
    const { width, height } = container.getBoundingClientRect();

    const touch = e.touches[0];
    const moveX = touch.clientX - touchStart.x;
    const moveY = touch.clientY - touchStart.y;

    const newX = Math.max(0, Math.min(100, touchPosition.x - (moveX / width) * 100));
    const newY = Math.max(0, Math.min(100, touchPosition.y - (moveY / height) * 100));

    setZoomPosition({ x: newX, y: newY });
    setTouchPosition({ x: newX, y: newY });
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  };

  const handlePinch = (e) => {
    if (!isZoomed || isModalOpen || fullscreenImage || e.touches.length < 2) return;

    e.preventDefault();

    const touch1 = e.touches[0];
    const touch2 = e.touches[1];

    const currentDistance = Math.hypot(
      touch2.clientX - touch1.clientX,
      touch2.clientY - touch1.clientY
    );

    if (initialDistance === null) {
      setInitialDistance(currentDistance);
      setInitialScale(zoomScale);
      return;
    }

    const scale = Math.min(Math.max(1, initialScale * (currentDistance / initialDistance)), 3);
    setZoomScale(scale);
  };

  const handleTouchEnd = () => {
    setTouchStart(null);
    setTouchPosition(zoomPosition);
    setInitialDistance(null);
  };

  const calculateHotspotPosition = (position) => {
    if (!position || !imageDimensions.naturalWidth) return { left: 0, top: 0 };

    const { x, y } = position;
    const { offsetX, offsetY, scaleFactor } = imageDimensions;

    const left = offsetX + (x / 100) * imageDimensions.naturalWidth * scaleFactor;
    const top = offsetY + (y / 100) * imageDimensions.naturalHeight * scaleFactor;

    return {
      left,
      top,
      width: imageDimensions.naturalWidth * scaleFactor,
      height: imageDimensions.naturalHeight * scaleFactor
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
                setIsZoomed(false);
                setZoomScale(1);
              }}
            >
              Front View
            </button>
            <button
              className={`view-button ${currentView === 'back' ? 'active' : ''}`}
              onClick={() => {
                setCurrentView('back');
                setIsZoomed(false);
                setZoomScale(1);
              }}
            >
              Back View
            </button>
          </div>

          <div
            ref={imgContainerRef}
            className={`wheelchair-image-container ${isZoomed ? 'zoomed-mobile' : ''}`}
            onClick={handleImageClick}
            onMouseMove={handleMouseMove}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {!isImageLoaded && (
              <div className="image-loading"></div>
            )}
            <div className={`image-wrapper ${!isZoomed && isZooming ? 'zooming' : ''} ${rotatingView === currentView ? 'initial-rotate' : ''}`}>
              <img
                ref={(node) => {
                  imgRef.current = node;
                  currentImgRef.current = node;
                }}
                src={currentView === 'front'
                  ? "/assets/images/front.jpg"
                  : "/assets/images/back.jpg"}
                alt={`Wheelchair ${currentView} view`}
                className={`wheelchair-image ${isZoomed ? 'zoomed' : ''} ${isZoomed ? 'zoomed-mobile' : ''}`}
                style={{
                  transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                  transform: isZoomed ? `scale(${zoomScale})` : 'scale(1)',
                  opacity: isImageLoaded ? 1 : 0,
                  transition: 'opacity 0.3s ease, transform 0.3s ease'
                }}
                onLoad={updateImageDimensions}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/assets/images/placeholder.jpg";
                }}
              />

              {!isZoomed && isImageLoaded && parts.map((part) => {
                const position = currentView === 'front'
                  ? part.frontPosition
                  : part.backPosition;

                if (!position) return null;

                const { left, top } = calculateHotspotPosition(position);

                return (
                  <div
                    key={`${part.id}-${currentView}`}
                    className="hotspot"
                    style={{
                      position: 'absolute',
                      left: `${left}px`,
                      top: `${top}px`,
                      transform: 'translate(-50%, -50%)',
                      transition: 'transform 0.3s ease',
                      zIndex: 10
                    }}
                    onClick={(e) => handlePartClick(part, e)}
                  >
                    <div className="hotspot-marker"></div>
                    <div className="hotspot-tooltip">
                      {part.name}
                    </div>
                  </div>
                );
              })}
            </div>
            {isZoomed && ('ontouchstart' in window || navigator.maxTouchPoints) && (
              <div className="zoom-instructions">
                Pinch to zoom, drag to pan, tap to exit
              </div>
            )}
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
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleFullscreenTouchStart}
            onTouchMove={handleFullscreenTouchMove}
            onTouchEnd={handleFullscreenTouchEnd}
          >
            <button
              className="nav-button prev-button"
              onClick={(e) => {
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
              onClick={(e) => {
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
        y: PropTypes.number
      }),
      backPosition: PropTypes.shape({
        x: PropTypes.number,
        y: PropTypes.number
      })
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
