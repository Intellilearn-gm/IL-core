import React from 'react';
// import { Link } from 'react-router-dom'; // No longer needed directly here
import GameCard from '../../components/Card/GameCard';
import './DashboardPage.css';

const games = [
  { id: 'archery', title: 'Archery Pro', description: 'Test your aim and precision in this classic archery challenge.', image: 'https://placehold.co/600x400/E97451/FFF?text=Archery', path: '/game/archery' },
  { id: 'dao-dungeon', title: 'DAO Dungeon', description: 'Explore treacherous dungeons, make decisions, and seek glory.', image: 'https://placehold.co/600x400/3A4E48/FFF?text=DAO+Dungeon', path: '/game/dao-dungeon' },
  { id: 'block-miner', title: 'Block Miner', description: 'Dig deep, mine valuable blocks, and upgrade your gear.', image: 'https://placehold.co/600x400/50623A/FFF?text=Block+Miner', path: '/game/block-miner' },
  { id: 'code-quest', title: 'OC Code Quest', description: 'Embark on a quest to solve coding puzzles and learn.', image: 'https://placehold.co/600x400/2E2356/FFF?text=Code+Quest', path: '/game/code-quest' },
  // Add more games here, example of a disabled/coming soon game:
  // { id: 'space-shooter', title: 'Space Shooter', description: 'Blast aliens in outer space!', image: 'https://placehold.co/600x400/1A1A2E/FFF?text=Space+Shooter', path: '/game/space-shooter', disabled: true },
];

const DashboardPage = () => {
  return (
    <div className="dashboard-page">
      <section className="dashboard-hero">
        <div className="dashboard-hero-content">
          <h1>Welcome to the IntelliLearn!</h1>
          <p>Choose a game from our collection below and start your adventure. Powered by IntelliLearn.</p>
        </div>
      </section>
      <section className="dashboard-games-list">
        <h2>Our Games</h2>
        <div className="cards-container">
          {games.map(game => (
            <GameCard
              key={game.id}
              title={game.title}
              description={game.description}
              image={game.image}
              playLink={game.path}
              disabled={game.disabled}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;