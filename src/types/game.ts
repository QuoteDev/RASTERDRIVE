// Core game types for RASTERDRIVE

export type Shape = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';
export type Badge = 'None' | 'Echo' | 'Cache' | 'Seal';

export interface PieceVariant {
  id: string;
  shape: Shape;
  badge: Badge;
  weight: number;
}

export type Rail = 'Base+' | 'Rev+' | '×Amp' | 'Economy' | 'RNG';
export type Rarity = 'Common' | 'Rare' | 'Mythic';

export interface ModuleDef {
  id: string;
  name: string;
  rail: Rail;
  rarity: Rarity;
  text: string;
  levels?: number[];
}

export type Outcome = 'prime' | 'minor' | 'miss';

export interface Cell {
  filled: boolean;
  color: string;
  badge: Badge;
}

export interface Board {
  cells: Cell[][];
  width: number;
  height: number;
}

export interface Piece {
  shape: Shape;
  badge: Badge;
  x: number;
  y: number;
  rotation: number;
}

export interface JunkCard {
  id: string;
  pattern: number[][];
  name: string;
}

export interface Contract {
  id: string;
  name: string;
  description: string;
  reward: number;
  completed: boolean;
  progress: number;
  target: number;
}

export interface Showcase {
  id: string;
  name: string;
  rule: string;
  primeOverride?: string;
  gravityMultiplier?: number;
  apply: (state: GameState) => void;
  remove: (state: GameState) => void;
}

export interface GameState {
  // Run progress
  stage: number;
  series: number;
  target: number;
  total: number;

  // Scoring
  rev: number;
  lastOutcomes: Outcome[];
  echoQueue: number;
  lastScoringResult: ScoringResult | null;

  // Economy
  credits: number;

  // Build
  modules: string[];
  ownedVariants: Record<Shape, PieceVariant[]>;
  sealCount: number;

  // Board state
  board: Board;
  currentPiece: Piece | null;
  queue: Piece[];
  held: Piece | null;
  canSwapHold: boolean;

  // Junk
  junkDeck: JunkCard[];
  junkForecast: JunkCard[];
  junkTimer: number;
  junkTimerMax: number;

  // Contracts & Showcase
  contracts: Contract[];
  currentShowcase: Showcase | null;

  // Meta
  seed: number;
  locksSinceLastClear: number;
  piecesPlaced: number;
}

export interface ScoringContext {
  linesCleared: number;
  isPerfectClear: boolean;
  cells: Cell[];
  modules: string[];
  sealCount: number;
  echoQueue: number;
  rev: number;
}

export interface ScoringResult {
  base: number;
  xValue: number;
  carryAdd: number;
  delta: number;
  creditsGained: number;
}

export interface InputState {
  left: boolean;
  right: boolean;
  down: boolean;
  hardDrop: boolean;
  rotateCW: boolean;
  rotateCCW: boolean;
  rotate180: boolean;
  hold: boolean;
}

export interface GameOptions {
  crtMode: 'Off' | 'Tasteful' | 'Arcade';
  sfxVolume: number;
  musicVolume: number;
  highContrast: boolean;
  reduceMotion: boolean;
  keyBindings: Record<string, string>;
}
