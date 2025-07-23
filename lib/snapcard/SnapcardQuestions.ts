import { commonQuestions } from './questions/common';
import { randomQuestionsPool } from './questions/pool';

export function getSnapcardQuestions() {
  // Shuffle random pool and pick 5
  const shuffled = [...randomQuestionsPool].sort(() => 0.5 - Math.random());
  const selectedRandom = shuffled.slice(0, 5);
  // Combine with common
  const questions = [...commonQuestions, ...selectedRandom];
  // Shuffle final order
  return questions.sort(() => 0.5 - Math.random());
} 