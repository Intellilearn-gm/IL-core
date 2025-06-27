import { THEME_COLORS, SCALE_FACTOR, PLAYER_HIT_RADIUS, ENEMY_HIT_RADIUS } from './constants';
import { Position, Arrow, EnemyAIState } from './types';

const CHARACTER_FOOT_OFFSET = 5 * SCALE_FACTOR;

export function drawPlayerArcher(ctx: CanvasRenderingContext2D, x: number, y: number, angleDeg: number, powerPercent: number) {
  if (!ctx) return;
  ctx.save();
  const bodyColor = THEME_COLORS.PLAYER_SILHOUETTE;
  ctx.fillStyle = bodyColor;
  ctx.strokeStyle = bodyColor;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Dimensions
  const headRadius = 9 * SCALE_FACTOR;
  const bodyHeight = 45 * SCALE_FACTOR;
  const legLength = 35 * SCALE_FACTOR;
  const armLength = 25 * SCALE_FACTOR;
  const limbThickness = 8 * SCALE_FACTOR;
  const bowThickness = 6 * SCALE_FACTOR;
  const legSpread = 15 * SCALE_FACTOR;

  // Coordinates
  const groundY = y + CHARACTER_FOOT_OFFSET;
  const bodyBottomY = groundY - legLength;
  const bodyTopY = bodyBottomY - bodyHeight;
  const headCenterY = bodyTopY - headRadius * 0.7;
  const angleRad = (-angleDeg * Math.PI) / 180;

  // Legs (quadratic curves for bent look)
  ctx.lineWidth = limbThickness;
  ctx.strokeStyle = bodyColor;
  ctx.beginPath();
  const leftKneeX = x - legSpread * 0.8;
  const leftKneeY = bodyBottomY + legLength * 0.5;
  ctx.moveTo(x, bodyBottomY);
  ctx.quadraticCurveTo(leftKneeX, leftKneeY, x - legSpread, groundY);
  const rightKneeX = x + legSpread * 0.2;
  const rightKneeY = bodyBottomY + legLength * 0.6;
  ctx.moveTo(x, bodyBottomY);
  ctx.quadraticCurveTo(rightKneeX, rightKneeY, x + legSpread, groundY);
  ctx.stroke();

  // Body (torso)
  ctx.beginPath();
  ctx.moveTo(x, bodyBottomY);
  ctx.lineTo(x, bodyTopY);
  ctx.stroke();

  // Head
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.arc(x, headCenterY, headRadius, 0, Math.PI * 2);
  ctx.fill();

  // Arms and Bow
  ctx.strokeStyle = bodyColor;
  ctx.lineWidth = limbThickness;
  const shoulderX = x;
  const shoulderY = bodyTopY + 5 * SCALE_FACTOR;

  // Back arm (pulling string) - Quadratic curve for bent elbow
  const elbowAngle = Math.PI * 1.1;
  const elbowDist = armLength * 0.6;
  const backElbowX = shoulderX + elbowDist * Math.cos(elbowAngle);
  const backElbowY = shoulderY + elbowDist * Math.sin(elbowAngle);
  const pullBackDist = (powerPercent / 100) * (armLength * 0.5);
  const bowCenterApproxX = shoulderX + armLength * Math.cos(angleRad) * 0.8;
  const bowCenterApproxY = shoulderY + armLength * Math.sin(angleRad) * 0.8;
  const backHandX = bowCenterApproxX - pullBackDist * Math.cos(angleRad + Math.PI * 0.1);
  const backHandY = bowCenterApproxY - pullBackDist * Math.sin(angleRad + Math.PI * 0.1);
  ctx.beginPath();
  ctx.moveTo(shoulderX, shoulderY);
  ctx.quadraticCurveTo(backElbowX, backElbowY, backHandX, backHandY);
  ctx.stroke();

  // Front arm (holding bow) - Straight line
  const frontHandX = shoulderX + armLength * Math.cos(angleRad);
  const frontHandY = shoulderY + armLength * Math.sin(angleRad);
  ctx.beginPath();
  ctx.moveTo(shoulderX, shoulderY);
  ctx.lineTo(frontHandX, frontHandY);
  ctx.stroke();

  // Bow (arc shape)
  ctx.save();
  ctx.translate(frontHandX, frontHandY);
  ctx.rotate(angleRad);
  ctx.strokeStyle = bodyColor;
  ctx.lineWidth = bowThickness;
  ctx.beginPath();
  const bowRadius = armLength * 1.3;
  const bowStartAngle = Math.PI * 0.4;
  const bowEndAngle = -Math.PI * 0.4;
  ctx.arc(0, 0, bowRadius, bowStartAngle, bowEndAngle, true);
  ctx.stroke();
  ctx.restore();

  // Bow String
  ctx.save();
  ctx.strokeStyle = THEME_COLORS.BOW_STRING;
  ctx.lineWidth = 1 * SCALE_FACTOR;
  ctx.beginPath();
  const tipDist = bowRadius;
  const topTipX = frontHandX + tipDist * Math.cos(angleRad + bowStartAngle);
  const topTipY = frontHandY + tipDist * Math.sin(angleRad + bowStartAngle);
  const bottomTipX = frontHandX + tipDist * Math.cos(angleRad + bowEndAngle);
  const bottomTipY = frontHandY + tipDist * Math.sin(angleRad + bowEndAngle);
  ctx.moveTo(topTipX, topTipY);
  ctx.lineTo(backHandX, backHandY);
  ctx.lineTo(bottomTipX, bottomTipY);
  ctx.stroke();
  ctx.restore();

  // Nocked Arrow (visual representation before firing)
  ctx.save();
  const arrowLengthDraw = armLength * 1.5;
  const arrowAngle = angleRad;
  const arrowStartX = backHandX;
  const arrowStartY = backHandY;
  const arrowEndX = arrowStartX + arrowLengthDraw * Math.cos(arrowAngle);
  const arrowEndY = arrowStartY + arrowLengthDraw * Math.sin(arrowAngle);
  // Shaft
  ctx.strokeStyle = THEME_COLORS.NOCKED_ARROW_SHAFT;
  ctx.lineWidth = 2.5 * SCALE_FACTOR;
  ctx.beginPath();
  ctx.moveTo(arrowStartX, arrowStartY);
  ctx.lineTo(arrowEndX, arrowEndY);
  ctx.stroke();
  // Head
  ctx.fillStyle = THEME_COLORS.NOCKED_ARROW_HEAD;
  const headLengthDraw = 10 * SCALE_FACTOR;
  const headWidthDraw = 5 * SCALE_FACTOR;
  ctx.beginPath();
  ctx.moveTo(arrowEndX + headLengthDraw * Math.cos(arrowAngle), arrowEndY + headLengthDraw * Math.sin(arrowAngle));
  ctx.lineTo(arrowEndX + headWidthDraw * Math.cos(arrowAngle + Math.PI / 2), arrowEndY + headWidthDraw * Math.sin(arrowAngle + Math.PI / 2));
  ctx.lineTo(arrowEndX + headWidthDraw * Math.cos(arrowAngle - Math.PI / 2), arrowEndY + headWidthDraw * Math.sin(arrowAngle - Math.PI / 2));
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  ctx.restore();
}

export function drawEnemyArcher(ctx: CanvasRenderingContext2D, x: number, y: number, name: string, bowDraw = 0) {
  if (!ctx) return;
  ctx.save();
  const bodyColor = THEME_COLORS.ENEMY;
  const accentColor = THEME_COLORS.ENEMY_ACCENT;
  ctx.strokeStyle = bodyColor;
  ctx.fillStyle = bodyColor;
  ctx.lineWidth = 3 * SCALE_FACTOR;

  // Dimensions
  const headRadius = 8 * SCALE_FACTOR;
  const bodyHeight = 45 * SCALE_FACTOR;
  const legLength = 30 * SCALE_FACTOR;
  const armLength = 20 * SCALE_FACTOR;
  const bowRadiusDraw = 18 * SCALE_FACTOR;
  const legSpread = 10 * SCALE_FACTOR;

  // Coordinates
  const groundY = y + CHARACTER_FOOT_OFFSET;
  const bodyBottomY = groundY - legLength;
  const bodyTopY = bodyBottomY - bodyHeight;
  const headCenterY = bodyTopY - headRadius;

  // Legs (simple lines)
  ctx.beginPath();
  ctx.moveTo(x, bodyBottomY);
  ctx.lineTo(x - legSpread, groundY);
  ctx.moveTo(x, bodyBottomY);
  ctx.lineTo(x + legSpread, groundY);
  ctx.stroke();

  // Body
  ctx.beginPath();
  ctx.moveTo(x, bodyBottomY);
  ctx.lineTo(x, bodyTopY);
  ctx.stroke();

  // Head
  ctx.beginPath();
  ctx.arc(x, headCenterY, headRadius, 0, Math.PI * 2);
  ctx.fill();

  // Eye (accent color)
  ctx.fillStyle = accentColor;
  const eyeRadius = 1.8 * SCALE_FACTOR;
  const eyeX = x - headRadius * 0.4;
  const eyeY = headCenterY - headRadius * 0.1;
  ctx.beginPath();
  ctx.arc(eyeX, eyeY, eyeRadius, 0, Math.PI * 2);
  ctx.fill();

  // Arms (simple lines)
  const shoulderX = x;
  const shoulderY = bodyTopY + 5 * SCALE_FACTOR;
  // Back arm (idle position)
  ctx.beginPath();
  ctx.moveTo(shoulderX, shoulderY);
  ctx.lineTo(shoulderX + 10 * SCALE_FACTOR, shoulderY + 15 * SCALE_FACTOR);
  ctx.stroke();
  // Front arm (holding bow)
  const handX = shoulderX - armLength;
  const handY = shoulderY;
  ctx.beginPath();
  ctx.moveTo(shoulderX, shoulderY);
  ctx.lineTo(handX, handY);
  ctx.stroke();

  // Bow and Animated String
  ctx.save();
  ctx.translate(handX, handY);
  // Bow (arc)
  ctx.strokeStyle = THEME_COLORS.BOW;
  ctx.lineWidth = 2.5 * SCALE_FACTOR;
  ctx.beginPath();
  ctx.arc(0, 0, bowRadiusDraw, Math.PI / 2, -Math.PI / 2, false);
  ctx.stroke();
  // String (animated pullback)
  ctx.strokeStyle = THEME_COLORS.BOW_STRING;
  ctx.lineWidth = 1 * SCALE_FACTOR;
  ctx.beginPath();
  const topTipX = 0;
  const topTipY = bowRadiusDraw;
  const bottomTipX = 0;
  const bottomTipY = -bowRadiusDraw;
  const maxPull = 15 * SCALE_FACTOR;
  const pullX = maxPull * bowDraw;
  const pullY = 0;
  ctx.moveTo(topTipX, topTipY);
  ctx.lineTo(pullX, pullY);
  ctx.lineTo(bottomTipX, bottomTipY);
  ctx.stroke();
  ctx.restore();

  // Draw Enemy Name (A, B, C, D) above head
  ctx.save();
  ctx.fillStyle = THEME_COLORS.TEXT;
  ctx.font = `${14 * SCALE_FACTOR}px Arial`;
  ctx.textAlign = 'center';
  const textY = headCenterY - headRadius - 7 * SCALE_FACTOR;
  ctx.fillText(name, x, textY);
  ctx.restore();

  ctx.restore();
}

export function drawArrow(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number) {
  if (!ctx) return;
  const arrowLength = 25 * SCALE_FACTOR;
  const shaftWidth = 2 * SCALE_FACTOR;
  const headLength = 6 * SCALE_FACTOR;
  const headWidth = 5 * SCALE_FACTOR;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  // Shaft
  ctx.fillStyle = THEME_COLORS.ARROW;
  ctx.fillRect(-arrowLength * 0.7, -shaftWidth / 2, arrowLength, shaftWidth);
  // Head
  ctx.fillStyle = THEME_COLORS.ARROW_HEAD;
  const headBaseX = arrowLength * 0.3;
  ctx.beginPath();
  ctx.moveTo(headBaseX, -headWidth / 2);
  ctx.lineTo(headBaseX + headLength, 0);
  ctx.lineTo(headBaseX, headWidth / 2);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export function drawTrajectoryPreview(ctx: CanvasRenderingContext2D, points: { x: number; y: number }[]) {
  if (!ctx || points.length === 0) return;
  ctx.save();
  ctx.fillStyle = THEME_COLORS.TRAJECTORY_DOT;
  points.forEach((point, index) => {
    if (index % 3 === 0) {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 1.5 * SCALE_FACTOR, 0, Math.PI * 2);
      ctx.fill();
    }
  });
  ctx.restore();
}

export function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  color = THEME_COLORS.TEXT,
  font = `${14 * SCALE_FACTOR}px Arial`
) {
  if (!ctx || !text) return y;
  ctx.fillStyle = color;
  ctx.font = font;
  const words = text.split(' ');
  let line = '';
  let currentY = y;
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line.trim(), x, currentY);
      line = words[n] + ' ';
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), x, currentY);
  return currentY + lineHeight;
}

// Add any other drawing helpers as needed 