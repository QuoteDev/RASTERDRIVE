// Default piece variants - starter set for testing and early game

import { PieceVariant, Shape } from '@/types/game';

// Helper to create variant IDs
function variantId(shape: Shape, badge: string, index: number = 0): string {
  return `${shape.toLowerCase()}_${badge.toLowerCase()}${index > 0 ? `_${index}` : ''}`;
}

// Basic variants (no badge) - always available
export const BASIC_VARIANTS: PieceVariant[] = [
  { id: variantId('I', 'basic'), shape: 'I', badge: 'None', weight: 1 },
  { id: variantId('O', 'basic'), shape: 'O', badge: 'None', weight: 1 },
  { id: variantId('T', 'basic'), shape: 'T', badge: 'None', weight: 1 },
  { id: variantId('S', 'basic'), shape: 'S', badge: 'None', weight: 1 },
  { id: variantId('Z', 'basic'), shape: 'Z', badge: 'None', weight: 1 },
  { id: variantId('J', 'basic'), shape: 'J', badge: 'None', weight: 1 },
  { id: variantId('L', 'basic'), shape: 'L', badge: 'None', weight: 1 },
];

// Starter Echo variants - available from beginning for testing
export const STARTER_ECHO_VARIANTS: PieceVariant[] = [
  { id: variantId('I', 'echo'), shape: 'I', badge: 'Echo', weight: 0.3 },
  { id: variantId('T', 'echo'), shape: 'T', badge: 'Echo', weight: 0.3 },
];

// Starter Cache variants - available from beginning for testing
export const STARTER_CACHE_VARIANTS: PieceVariant[] = [
  { id: variantId('O', 'cache'), shape: 'O', badge: 'Cache', weight: 0.3 },
  { id: variantId('L', 'cache'), shape: 'L', badge: 'Cache', weight: 0.3 },
];

// Starter Seal variants - available from beginning for testing
export const STARTER_SEAL_VARIANTS: PieceVariant[] = [
  { id: variantId('J', 'seal'), shape: 'J', badge: 'Seal', weight: 0.2 },
];

// All purchasable variants (for shop system)
export const PURCHASABLE_VARIANTS: PieceVariant[] = [
  // More Echo variants
  { id: variantId('O', 'echo'), shape: 'O', badge: 'Echo', weight: 0.5 },
  { id: variantId('S', 'echo'), shape: 'S', badge: 'Echo', weight: 0.5 },
  { id: variantId('Z', 'echo'), shape: 'Z', badge: 'Echo', weight: 0.5 },
  { id: variantId('J', 'echo'), shape: 'J', badge: 'Echo', weight: 0.5 },
  { id: variantId('L', 'echo'), shape: 'L', badge: 'Echo', weight: 0.5 },

  // More Cache variants
  { id: variantId('I', 'cache'), shape: 'I', badge: 'Cache', weight: 0.5 },
  { id: variantId('T', 'cache'), shape: 'T', badge: 'Cache', weight: 0.5 },
  { id: variantId('S', 'cache'), shape: 'S', badge: 'Cache', weight: 0.5 },
  { id: variantId('Z', 'cache'), shape: 'Z', badge: 'Cache', weight: 0.5 },
  { id: variantId('J', 'cache'), shape: 'J', badge: 'Cache', weight: 0.5 },

  // More Seal variants
  { id: variantId('I', 'seal'), shape: 'I', badge: 'Seal', weight: 0.3 },
  { id: variantId('O', 'seal'), shape: 'O', badge: 'Seal', weight: 0.3 },
  { id: variantId('T', 'seal'), shape: 'T', badge: 'Seal', weight: 0.3 },
  { id: variantId('S', 'seal'), shape: 'S', badge: 'Seal', weight: 0.3 },
  { id: variantId('Z', 'seal'), shape: 'Z', badge: 'Seal', weight: 0.3 },
  { id: variantId('L', 'seal'), shape: 'L', badge: 'Seal', weight: 0.3 },

  // Duplicate variants (higher weight versions)
  { id: variantId('I', 'echo', 2), shape: 'I', badge: 'Echo', weight: 0.6 },
  { id: variantId('T', 'cache', 2), shape: 'T', badge: 'Cache', weight: 0.6 },
  { id: variantId('O', 'seal', 2), shape: 'O', badge: 'Seal', weight: 0.5 },
];

// Get starter variants for new game
export function getStarterVariants(): PieceVariant[] {
  return [
    ...BASIC_VARIANTS,
    ...STARTER_ECHO_VARIANTS,
    ...STARTER_CACHE_VARIANTS,
    ...STARTER_SEAL_VARIANTS,
  ];
}
