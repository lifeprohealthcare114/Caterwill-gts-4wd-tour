import React from 'react';
import './SpecsCard.css';

const SpecsCard = ({ title, value, icon }) => {
  return (
    <div className="specs-card">
      <div className="card-icon">{icon}</div>
      <h3 className="card-title">{title}</h3>
      <p className="card-value">{value}</p>
    </div>
  );
};

export default SpecsCard;