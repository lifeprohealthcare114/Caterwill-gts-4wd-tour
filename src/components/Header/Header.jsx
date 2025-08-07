// Header.js
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  
  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="brand">
          Caterwil GTS-4WD
        </Link>
        
        {!isHomePage && (
          <nav className="nav">
            <ul className="nav-list">
              <li className="nav-item">
                <Link to="/" className="nav-link">
                  Home
                </Link>
              </li>
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;