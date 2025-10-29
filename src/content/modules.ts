// Module definitions - 30 day-one modules for build variety

import { ModuleDef } from '@/types/game';

export const MODULES: ModuleDef[] = [
  // BASE+ Modules
  {
    id: 'feedback_loop',
    name: 'Feedback Loop',
    rail: 'Base+',
    rarity: 'Common',
    text: '+150 Base if previous clear was ≥2 lines',
  },
  {
    id: 'first_strike',
    name: 'First Strike',
    rail: 'Base+',
    rarity: 'Common',
    text: '+200 Base for first clear of each stage',
  },
  {
    id: 'accumulator',
    name: 'Accumulator',
    rail: 'Base+',
    rarity: 'Rare',
    text: '+50 Base per clear this stage (stacks)',
  },
  {
    id: 'perfect_bonus',
    name: 'Perfect Bonus',
    rail: 'Base+',
    rarity: 'Rare',
    text: '+500 Base on Perfect Clear',
  },
  {
    id: 'quad_master',
    name: 'Quad Master',
    rail: 'Base+',
    rarity: 'Common',
    text: '+300 Base on 4-line clear',
  },

  // REV+ Modules
  {
    id: 'sequence_engine',
    name: 'Sequence Engine',
    rail: 'Rev+',
    rarity: 'Rare',
    text: '+0.5 Rev if you alternate 2/4 line clears',
  },
  {
    id: 'momentum',
    name: 'Momentum',
    rail: 'Rev+',
    rarity: 'Common',
    text: 'Prevent Rev loss on first Miss each stage',
  },
  {
    id: 'prime_surge',
    name: 'Prime Surge',
    rail: 'Rev+',
    rarity: 'Mythic',
    text: '+1.0 Rev on Prime (instead of +0.5)',
  },
  {
    id: 'rev_floor',
    name: 'Rev Floor',
    rail: 'Rev+',
    rarity: 'Rare',
    text: 'Rev cannot go below ×1.5',
  },
  {
    id: 'chain_reaction',
    name: 'Chain Reaction',
    rail: 'Rev+',
    rarity: 'Common',
    text: '+0.3 Rev for 3 consecutive Primes',
  },

  // ×AMP Modules
  {
    id: 'catalog_shot',
    name: 'Catalog Shot',
    rail: '×Amp',
    rarity: 'Rare',
    text: '×1.6 if clear uses only one shape',
  },
  {
    id: 'diversity',
    name: 'Diversity',
    rail: '×Amp',
    rarity: 'Common',
    text: '×1.3 if clear uses 3+ different shapes',
  },
  {
    id: 'tall_stack',
    name: 'Tall Stack',
    rail: '×Amp',
    rarity: 'Common',
    text: '×1.4 if stack height ≥15 rows',
  },
  {
    id: 'low_ceiling',
    name: 'Low Ceiling',
    rail: '×Amp',
    rarity: 'Common',
    text: '×1.5 if stack height ≤8 rows',
  },
  {
    id: 'double_double',
    name: 'Double Double',
    rail: '×Amp',
    rarity: 'Mythic',
    text: '×2.0 if clear is exactly 2 lines',
  },
  {
    id: 'quad_king',
    name: 'Quad King',
    rail: '×Amp',
    rarity: 'Mythic',
    text: '×2.5 if clear is 4 lines',
  },

  // ECONOMY Modules
  {
    id: 'bulkhead',
    name: 'Bulkhead',
    rail: 'Economy',
    rarity: 'Common',
    text: '+$1 per Cache; +$1 extra if any Seal participated',
  },
  {
    id: 'interest',
    name: 'Interest',
    rail: 'Economy',
    rarity: 'Rare',
    text: '+$1 per 5 Credits you have (max +$10)',
  },
  {
    id: 'payday',
    name: 'Payday',
    rail: 'Economy',
    rarity: 'Common',
    text: '+$5 when Stage Target met',
  },
  {
    id: 'contract_bonus',
    name: 'Contract Bonus',
    rail: 'Economy',
    rarity: 'Rare',
    text: '+$3 when Contract completed',
  },
  {
    id: 'jackpot',
    name: 'Jackpot',
    rail: 'Economy',
    rarity: 'Mythic',
    text: '+$20 on Perfect Clear',
  },

  // RNG Modules
  {
    id: 'imprint',
    name: 'Imprint',
    rail: 'RNG',
    rarity: 'Common',
    text: 'Slightly bias bag toward last used shape',
  },
  {
    id: 'avoid',
    name: 'Avoid',
    rail: 'RNG',
    rarity: 'Common',
    text: 'Slightly bias bag against last used shape',
  },
  {
    id: 'i_piece_lover',
    name: 'I-Piece Lover',
    rail: 'RNG',
    rarity: 'Rare',
    text: 'Double weight of I pieces',
  },
  {
    id: 't_spin_setup',
    name: 'T-Spin Setup',
    rail: 'RNG',
    rarity: 'Rare',
    text: 'Double weight of T pieces',
  },
  {
    id: 'lucky_seven',
    name: 'Lucky Seven',
    rail: 'RNG',
    rarity: 'Mythic',
    text: 'First piece of each stage is always I',
  },

  // HYBRID Modules
  {
    id: 'synergy_core',
    name: 'Synergy Core',
    rail: '×Amp',
    rarity: 'Mythic',
    text: '×1.1 for each other module you have',
  },
  {
    id: 'echo_chamber',
    name: 'Echo Chamber',
    rail: 'Base+',
    rarity: 'Mythic',
    text: '+100 Base for each Echo badge in clear',
  },
  {
    id: 'cache_multiplier',
    name: 'Cache Multiplier',
    rail: '×Amp',
    rarity: 'Rare',
    text: '×1.2 if clear contains Cache badge',
  },
  {
    id: 'seal_of_approval',
    name: 'Seal of Approval',
    rail: 'Base+',
    rarity: 'Rare',
    text: '+100 Base for each Seal badge in clear',
  },
];

// Helper to get module by ID
export function getModuleById(id: string): ModuleDef | undefined {
  return MODULES.find((m) => m.id === id);
}

// Get modules by rarity
export function getModulesByRarity(rarity: 'Common' | 'Rare' | 'Mythic'): ModuleDef[] {
  return MODULES.filter((m) => m.rarity === rarity);
}

// Get modules by rail
export function getModulesByRail(rail: string): ModuleDef[] {
  return MODULES.filter((m) => m.rail === rail);
}
