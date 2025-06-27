// components/games/archery-pro/constants.ts

// Game logic constants
export const NUM_ENEMIES = 4
export const SCALE_FACTOR = 0.7
export const MIN_ENEMY_DISTANCE = 80 * SCALE_FACTOR
export const PLAYER_HIT_RADIUS = 25 * SCALE_FACTOR
export const ENEMY_HIT_RADIUS = 38 * SCALE_FACTOR
export const GRAVITY = 0.25 * SCALE_FACTOR
export const BASE_ENEMY_SPEED = 14 * Math.sqrt(SCALE_FACTOR)
export const ENEMY_FIRE_DELAY = 2000 // ms before enemies may fire
export const ENEMY_NAMES = ['A', 'B', 'C', 'D']
export const ASSESSMENT_API_URL =
  'http://localhost:3000/generate-question?topic=blockchain_basics'

// Fallback data if your API call fails
export const FALLBACK_ASSESSMENT_DATA = [
  {
    question: 'What is a blockchain?',
    options: [
      'A centralized database',
      'A peer-to-peer network of digital files',
      'A distributed ledger of transactions',
      'A form of cryptocurrency',
    ],
    Correct_option_index: 2,
    explanation:
      'Blockchain is a distributed ledger technology that records transactions across multiple computers to ensure the security and accuracy of data.',
    round: 1,
  },
  {
    question: 'Which provides security against tampering?',
    options: [
      'Public keys',
      'Smart contracts',
      'Cryptographic hashing',
      'Decentralization',
    ],
    Correct_option_index: 2,
    explanation:
      'Cryptographic hashing ensures that the data cannot be altered without being detected, as each block contains a hash of the previous block.',
    round: 2,
  },
  {
    question: 'What is the role of miners?',
    options: [
      'To create new blocks by solving problems',
      'To verify transactions and add them',
      'To provide liquidity',
      'To act as intermediaries',
    ],
    Correct_option_index: 1,
    explanation:
      'Miners verify transactions and compile them into blocks, which are then added to the blockchain, ensuring security and transparency.',
    round: 3,
  },
  {
    question: "What is a 'smart contract'?",
    options: [
      'A physical mining contract',
      'A type of virtual currency',
      'A self-executing contract in code',
      'A manual agreement',
    ],
    Correct_option_index: 2,
    explanation:
      'A smart contract is a self-executing contract with the terms of the agreement between buyer and seller being directly written into lines of code.',
    round: 4,
  },
  {
    question: 'Feature of public blockchain networks?',
    options: [
      'Restricted access',
      'Private/encrypted data',
      'Anyone can join and validate',
      'Primarily for enterprise use',
    ],
    Correct_option_index: 2,
    explanation:
      'Public blockchains operate as open networks where anyone can participate in the network activities like validating transactions.',
    round: 5,
  },
]

// UI theme colors
export const THEME_COLORS = {
  SKY_TOP: '#2c3e50',
  SKY_HORIZON: '#fd7e14',
  SKY_BOTTOM: '#e85a4f',
  GROUND: '#5a4d41',
  PLATFORM: '#282828',
  PLAYER_HEALTH_BAR: '#0090ff',
  ENEMY_HEALTH_BAR: '#a0a0a0',
  TEXT: '#ffffff',
  QUESTION_BG: 'rgba(10,10,20,0.8)',
  BUTTON: '#fd7e14',
  BUTTON_TEXT: '#ffffff',
  ARROW: '#f5f5f5',
  ARROW_HEAD: '#b0b0b0',
  TRAJECTORY_DOT: 'rgba(255,255,200,0.5)',
}
