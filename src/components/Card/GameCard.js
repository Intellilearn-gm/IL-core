import React from 'react';
import { Link } from 'react-router-dom';
import './GameCard.css';

const GameCard = ({ title, description, image, playLink, disabled }) => {
  return (
    <div className={`game-card ${disabled ? 'disabled' : ''}`}>
      <img src={image || 'https://via.placeholder.com/300x200?text=Game+Image'} alt={title} className="game-image" />
      <div className="game-card-content">
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <Link 
        to={disabled ? '#' : playLink} 
        className={`play-button ${disabled ? 'disabled' : ''}`}
        onClick={(e) => disabled && e.preventDefault()} // Prevent navigation if disabled
        aria-disabled={disabled}
      >
        {disabled ? 'Coming Soon' : 'Play Game'}
      </Link>
    </div>
  );
};

export default GameCard;