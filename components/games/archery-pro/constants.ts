// Archery Pro Game Constants and Theme Colors

export const NUM_ENEMIES = 4;
export const SCALE_FACTOR = 0.7;
export const MIN_ENEMY_DISTANCE = 80 * SCALE_FACTOR;
export const PLAYER_HIT_RADIUS = 25 * SCALE_FACTOR;
export const ENEMY_HIT_RADIUS = 38 * SCALE_FACTOR;
export const GRAVITY = 0.25 * SCALE_FACTOR;
export const BASE_ENEMY_SPEED = 14 * Math.sqrt(SCALE_FACTOR);
export const ENEMY_FIRETIME = 2000;
export const ENEMY_NAMES = ['A', 'B', 'C', 'D'];
export const ASSESSMENT_API_URL = 'http://localhost:3000/generate-question?topic=blockchain_basics';

export const fallbackAssessmentData = [
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
  // ... (add the rest of your fallback questions here)
];

export const THEME_COLORS = {
  SKY_TOP: '#2c3e50',
  SKY_HORIZON: '#fd7e14',
  SKY_BOTTOM: '#e85a4f',
  GROUND: '#5a4d41',
  GROUND_SHADOW: '#3e352f',
  MOUNTAIN: '#34495e',
  MOON: '#f1c40f',
  MOON_CRATER: 'rgba(255, 255, 255, 0.1)',
  PLATFORM: '#282828',
  PLAYER_HEALTH_BAR: '#0090ff',
  ENEMY_HEALTH_BAR: '#a0a0a0',
  TEXT: '#ffffff',
  QUESTION_BG: 'rgba(10, 10, 20, 0.8)',
  BUTTON: '#fd7e14',
  BUTTON_TEXT: '#ffffff',
  PLAYER_SILHOUETTE: '#4a3123',
  NOCKED_ARROW_SHAFT: '#a4785f',
  NOCKED_ARROW_HEAD: '#777777',
  ENEMY: 'black',
  ENEMY_ACCENT: '#f39c12',
  BOW: 'black',
  BOW_STRING: '#dddddd',
  ARROW: '#f5f5f5',
  ARROW_HEAD: '#b0b0b0',
  TRAJECTORY_DOT: 'rgba(255, 255, 200, 0.5)',
  BACKGROUND: '#000000',
}; 