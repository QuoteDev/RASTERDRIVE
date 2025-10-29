// Junk cards - patterns that spawn into the well

import { JunkCard } from '@/types/game';

// Junk patterns (1 = filled cell, 0 = empty)
export const JUNK_CARDS: JunkCard[] = [
  {
    id: 'single_column',
    name: 'Column',
    pattern: [
      [0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
    ],
  },
  {
    id: 'scattered',
    name: 'Scatter',
    pattern: [
      [1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
      [0, 0, 1, 0, 0, 1, 0, 0, 1, 0],
    ],
  },
  {
    id: 'left_stack',
    name: 'Stack L',
    pattern: [
      [1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
      [1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ],
  },
  {
    id: 'right_stack',
    name: 'Stack R',
    pattern: [
      [0, 0, 0, 0, 0, 0, 0, 1, 1, 1],
      [0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    ],
  },
  {
    id: 'checkerboard',
    name: 'Checker',
    pattern: [
      [1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
      [0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    ],
  },
  {
    id: 'center_wall',
    name: 'Wall',
    pattern: [
      [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
      [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
      [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
    ],
  },
  {
    id: 'sides',
    name: 'Sides',
    pattern: [
      [1, 1, 0, 0, 0, 0, 0, 0, 1, 1],
      [1, 1, 0, 0, 0, 0, 0, 0, 1, 1],
    ],
  },
  {
    id: 'single_row',
    name: 'Row',
    pattern: [[1, 0, 1, 0, 1, 0, 1, 0, 1, 0]],
  },
  {
    id: 'pyramid',
    name: 'Pyramid',
    pattern: [
      [0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
      [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
    ],
  },
  {
    id: 'corners',
    name: 'Corners',
    pattern: [
      [1, 1, 0, 0, 0, 0, 0, 0, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    ],
  },
];

// Get random junk cards for deck
export function generateJunkDeck(seed: number, count: number = 5): JunkCard[] {
  // Simple seeded shuffle
  const shuffled = [...JUNK_CARDS].sort(() => {
    seed = (seed * 9301 + 49297) % 233280;
    return (seed / 233280) - 0.5;
  });

  return shuffled.slice(0, count);
}
