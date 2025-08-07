import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header';
import Home from './pages/Home/Home';
import Viewer from './pages/Viewer/Viewer';
import Support from './pages/Support/Support';
import AudioPlayer from './components/AudioPlayer/AudioPlayer';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/viewer" element={<Viewer />} />
            <Route path="/support" element={<Support />} />
          </Routes>
        </main>
        <AudioPlayer />
      </div>
    </Router>
  );
}

export default App;