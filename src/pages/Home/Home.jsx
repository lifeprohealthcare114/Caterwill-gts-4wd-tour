import { Link, useNavigate } from 'react-router-dom'; // import useNavigate
import { useRef, useEffect } from 'react';
import './Home.css';

const Home = () => {
  const audioRef = useRef(null);
  const videoRef = useRef(null);  // ref for the video element
  const navigate = useNavigate();  // to programmatically navigate

  // Prevent scrolling on mount and enable on unmount
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'visible';
    };
  }, []);

  // Play audio when video ends (if you want it to start after video ends)
  // You can remove if no audio play is needed
  // useEffect(() => {
  //   audioRef.current?.pause();  // pause audio initially
  // }, []);

  const handleVideoEnded = () => {
    // Navigate to viewer page after video ends
    navigate('/viewer');
    // Optionally, you can start audio here if needed
    // audioRef.current?.play();
  };

  return (
    <div className="home-page">
      {/* Hidden audio element */}
      <audio 
        ref={audioRef} 
        src="/assets/audio/background-music.mp3" 
        loop 
      />
      
      <section className="hero-section">
        <div className="video-container">
          <video
            ref={videoRef}
            className="video-background"
            autoPlay
            muted
            // loop remove loop so it plays only once
            playsInline
            poster="/assets/videos/poster.jpg"
            onEnded={handleVideoEnded}
          >
            <source src="/assets/videos/wheelchair.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
        <div className="overlay"></div>
        
        <div className="hero-content">
          <h1 className="hero-title">Caterwil GTS-4WD</h1>
          <p className="hero-text">
            Experience revolutionary mobility with our advanced stair-climbing wheelchair technology.
          </p>
          <Link to="/viewer" className="hero-button">
            Explore Wheelchair Features
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
