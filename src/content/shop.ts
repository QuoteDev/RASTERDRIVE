// Shop system - pricing and availability for modules and variants

import { Module, MODULES } from './modules';
import { PieceVariant, PURCHASABLE_VARIANTS } from './variants';

export interface ShopModule {
  module: Module;
  price: number;
  available: boolean;
}

export interface ShopVariant {
  variant: PieceVariant;
  price: number;
  available: boolean;
}

// Module pricing by rail
const MODULE_PRICES: Record<string, number> = {
  // Base+ modules (cheaper, fundamental)
  feedback_loop: 200,
  sequence_engine: 250,
  catalog_shot: 200,
  buffer_overflow: 300,
  chain_reaction: 350,

  // Rev+ modules (mid-price, multiplier focused)
  momentum: 250,
  perfect_form: 300,
  quick_start: 200,
  reverb: 350,
  stability: 250,

  // ×Amp modules (expensive, powerful multipliers)
  bulkhead: 400,
  compound_interest: 500,
  overcharge: 450,
  prime_directive: 400,
  stack_overflow: 500,

  // Economy modules (mid-price, credit generation)
  dividend: 300,
  efficient_market: 350,
  golden_ratio: 400,
  hoarder: 250,
  reinvestment: 300,

  // RNG modules (cheap to mid, luck-based)
  chaos_theory: 250,
  critical_strike: 300,
  fortune_favors: 200,
  hot_streak: 350,
  insurance: 250,
  jackpot: 400,
  miracle_worker: 500,
  quantum_flux: 300,
  superstition: 200,
  wild_card: 350,
};

// Variant pricing
const VARIANT_PRICES: Record<string, number> = {
  // Echo variants (high value)
  'I_echo': 300,
  'T_echo': 300,
  'S_echo': 250,
  'Z_echo': 250,
  'J_echo': 250,
  'L_echo': 250,
  'O_echo': 200,

  // Cache variants (medium value)
  'I_cache': 250,
  'T_cache': 250,
  'S_cache': 200,
  'Z_cache': 200,
  'J_cache': 200,
  'L_cache': 200,
  'O_cache': 150,

  // Seal variants (low value, permanent boost)
  'I_seal': 200,
  'T_seal': 200,
  'S_seal': 150,
  'Z_seal': 150,
  'J_seal': 150,
  'L_seal': 150,
  'O_seal': 100,
};

export function getModulePrice(moduleId: string): number {
  return MODULE_PRICES[moduleId] || 999;
}

export function getVariantPrice(variantId: string): number {
  return VARIANT_PRICES[variantId] || 999;
}

export function getAvailableModules(
  ownedModules: string[]
): ShopModule[] {
  const shopModules: ShopModule[] = [];

  MODULES.forEach((module) => {
    const owned = ownedModules.includes(module.id);
    const price = getModulePrice(module.id);

    // All modules available from stage 1, but player can only buy what they can afford
    shopModules.push({
      module,
      price,
      available: !owned,
    });
  });

  return shopModules;
}

export function getAvailableVariants(
  ownedVariants: string[]
): ShopVariant[] {
  const shopVariants: ShopVariant[] = [];

  PURCHASABLE_VARIANTS.forEach((variant) => {
    const owned = ownedVariants.includes(variant.id);
    const price = getVariantPrice(variant.id);

    shopVariants.push({
      variant,
      price,
      available: !owned,
    });
  });

  return shopVariants;
}

// Maximum module slots
export const MAX_MODULE_SLOTS = 7;
export const STARTING_MODULE_SLOTS = 5;
