// Archery Pro Game Types

export interface AssessmentQuestion {
  question: string;
  options: string[];
  Correct_option_index: number;
  explanation: string;
  round: number;
}

export interface Position {
  x: number;
  y: number;
  platformY: number;
  id?: number;
  name?: string;
}

export interface Arrow {
  x: number;
  y: number;
  vx: number;
  vy: number;
  id: number;
  enemyIndex?: number;
  minMissDistance?: number;
  power?: number;
}

export interface EnemyAIState {
  id: number;
  lastAngle: number;
  lastSpeed: number;
  missDistance: number;
  improvementFactor: number;
  nextShotDelay: number;
  shotsFired: number;
  power: number;
  isDrawingBow: boolean;
  drawProgress: number;
  drawDuration: number;
  firePending: boolean;
} 