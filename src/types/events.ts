// Event types for RASTERDRIVE

import { ScoringResult } from './game';

export type GameEvent =
  | { type: 'line_clear'; lines: number }
  | { type: 'piece_lock'; shape: string }
  | { type: 'piece_rotate' }
  | { type: 'piece_move' }
  | { type: 'hard_drop' }
  | { type: 'hold_swap' }
  | { type: 'scoring'; result: ScoringResult }
  | { type: 'rev_up'; newRev: number }
  | { type: 'rev_down'; newRev: number }
  | { type: 'prime_clear' }
  | { type: 'perfect_clear' }
  | { type: 'module_fire'; moduleId: string; effect: string }
  | { type: 'cache_collect'; count: number; credits: number }
  | { type: 'junk_spawn'; cardId: string }
  | { type: 'junk_deleted' }
  | { type: 'stage_complete' }
  | { type: 'stage_start'; target: number }
  | { type: 'contract_progress'; contractId: string }
  | { type: 'contract_complete'; contractId: string }
  | { type: 'target_met' }
  | { type: 'game_over' };

export type EventCallback = (event: GameEvent) => void;
