// Shop UI - purchase modules and variants between stages

import * as PIXI from 'pixi.js';
import { BitmapFont } from '@/render/BitmapFont';
import { PixelUI } from '@/render/PixelUI';
import { snap } from '@/utils/math';
import {
  getAvailableModules,
  getAvailableVariants,
  ShopModule,
  ShopVariant,
  MAX_MODULE_SLOTS,
} from '@/content/shop';
import { Module } from '@/content/modules';
import { PieceVariant } from '@/content/variants';

type ShopTab = 'modules' | 'variants';

export interface ShopCallbacks {
  onPurchaseModule: (moduleId: string, price: number) => boolean;
  onPurchaseVariant: (variantId: string, price: number) => boolean;
  onContinue: () => void;
}

export class Shop {
  private container: PIXI.Container;
  private graphics: PIXI.Graphics;
  private callbacks: ShopCallbacks;

  private currentTab: ShopTab = 'modules';
  private scrollOffset: number = 0;
  private maxScroll: number = 0;
  private selectedIndex: number = 0;

  private credits: number = 0;
  private stage: number = 1;
  private ownedModules: string[] = [];
  private ownedVariants: string[] = [];

  private availableModules: ShopModule[] = [];
  private availableVariants: ShopVariant[] = [];

  private visible: boolean = false;

  constructor(callbacks: ShopCallbacks) {
    this.container = new PIXI.Container();
    this.graphics = new PIXI.Graphics();
    this.container.addChild(this.graphics);
    this.callbacks = callbacks;
    this.container.visible = false;

    // Listen for input
    this.setupInput();
  }

  private setupInput(): void {
    // Arrow keys for navigation and purchase
    window.addEventListener('keydown', (e) => {
      if (!this.visible) return;

      if (e.key === 'ArrowUp') {
        this.selectedIndex = Math.max(0, this.selectedIndex - 1);
        if (this.selectedIndex < this.scrollOffset) {
          this.scrollOffset = this.selectedIndex;
        }
        this.render();
      } else if (e.key === 'ArrowDown') {
        const maxIndex = this.currentTab === 'modules'
          ? this.availableModules.length - 1
          : this.availableVariants.length - 1;
        this.selectedIndex = Math.min(maxIndex, this.selectedIndex + 1);
        const maxVisible = 8; // Approximate visible items
        if (this.selectedIndex >= this.scrollOffset + maxVisible) {
          this.scrollOffset = Math.min(this.maxScroll, this.scrollOffset + 1);
        }
        this.render();
      } else if (e.key === 'Tab') {
        e.preventDefault();
        this.currentTab = this.currentTab === 'modules' ? 'variants' : 'modules';
        this.scrollOffset = 0;
        this.selectedIndex = 0;
        this.render();
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.attemptPurchase();
      } else if (e.key === 'Escape') {
        this.callbacks.onContinue();
      }
    });
  }

  private attemptPurchase(): void {
    if (this.currentTab === 'modules') {
      const shopModule = this.availableModules[this.selectedIndex];
      if (!shopModule) return;

      const canAfford = this.credits >= shopModule.price;
      const canPurchase = shopModule.available && canAfford && this.ownedModules.length < MAX_MODULE_SLOTS;

      if (canPurchase) {
        const success = this.callbacks.onPurchaseModule(shopModule.module.id, shopModule.price);
        if (success) {
          this.credits -= shopModule.price;
          this.ownedModules.push(shopModule.module.id);
          shopModule.available = false;
          this.render();
        }
      }
    } else {
      const shopVariant = this.availableVariants[this.selectedIndex];
      if (!shopVariant) return;

      const canAfford = this.credits >= shopVariant.price;
      const canPurchase = shopVariant.available && canAfford;

      if (canPurchase) {
        const success = this.callbacks.onPurchaseVariant(shopVariant.variant.id, shopVariant.price);
        if (success) {
          this.credits -= shopVariant.price;
          this.ownedVariants.push(shopVariant.variant.id);
          shopVariant.available = false;
          this.render();
        }
      }
    }
  }

  open(credits: number, stage: number, ownedModules: string[], ownedVariants: string[]): void {
    this.visible = true;
    this.credits = credits;
    this.stage = stage;
    this.ownedModules = ownedModules;
    this.ownedVariants = ownedVariants;
    this.scrollOffset = 0;
    this.selectedIndex = 0;

    // Load available items
    this.availableModules = getAvailableModules(ownedModules);
    this.availableVariants = getAvailableVariants(ownedVariants);

    // Group modules by rail for better organization
    this.availableModules.sort((a, b) => {
      if (a.module.rail !== b.module.rail) {
        return a.module.rail.localeCompare(b.module.rail);
      }
      return a.module.name.localeCompare(b.module.name);
    });

    this.container.visible = true;
    this.render();
  }

  close(): void {
    this.visible = false;
    this.container.visible = false;
  }

  private render(): void {
    this.graphics.clear();

    const screenWidth = 384;
    const screenHeight = 216;

    // Dark overlay
    this.graphics.beginFill(0x000000, 0.9);
    this.graphics.drawRect(0, 0, screenWidth, screenHeight);
    this.graphics.endFill();

    // Shop panel
    const panelX = 20;
    const panelY = 10;
    const panelWidth = screenWidth - 40;
    const panelHeight = screenHeight - 20;

    PixelUI.drawFrame(this.graphics, panelX, panelY, panelWidth, panelHeight, 0x00e0ff);

    // Header
    const headerY = panelY + 8;
    BitmapFont.drawText(
      this.graphics,
      'SHOP',
      panelX + panelWidth / 2 - 20,
      headerY,
      0x00e0ff,
      2
    );

    // Credits display
    const creditsText = `CREDITS: ${this.credits}`;
    BitmapFont.drawText(
      this.graphics,
      creditsText,
      panelX + 8,
      headerY + 18,
      0xffbd2e
    );

    // Stage display
    const stageText = `STAGE ${this.stage}`;
    BitmapFont.drawText(
      this.graphics,
      stageText,
      panelX + panelWidth - 8 - stageText.length * 4,
      headerY + 18,
      0xe6f2ff
    );

    // Module slots
    const slotsText = `SLOTS: ${this.ownedModules.length}/${MAX_MODULE_SLOTS}`;
    BitmapFont.drawText(
      this.graphics,
      slotsText,
      panelX + 8,
      headerY + 28,
      this.ownedModules.length >= MAX_MODULE_SLOTS ? 0xff6b6b : 0xe6f2ff
    );

    // Tabs
    const tabY = headerY + 42;
    this.drawTab('MODULES', panelX + 8, tabY, this.currentTab === 'modules');
    this.drawTab('VARIANTS', panelX + 80, tabY, this.currentTab === 'variants');

    // Content area
    const contentY = tabY + 14;
    const contentHeight = panelHeight - (contentY - panelY) - 20;

    if (this.currentTab === 'modules') {
      this.renderModules(panelX + 8, contentY, panelWidth - 16, contentHeight);
    } else {
      this.renderVariants(panelX + 8, contentY, panelWidth - 16, contentHeight);
    }

    // Footer instructions
    const footerY = panelY + panelHeight - 12;
    BitmapFont.drawText(
      this.graphics,
      'ARROWS:SELECT  ENTER:BUY  ESC:DONE',
      panelX + 8,
      footerY,
      0x666666
    );
  }

  private drawTab(text: string, x: number, y: number, active: boolean): void {
    const width = text.length * 4 + 8;
    const color = active ? 0x00e0ff : 0x333333;

    PixelUI.drawChip(this.graphics, x, y, width, 10, color);
    BitmapFont.drawText(this.graphics, text, x + 4, y + 2, active ? 0x000000 : 0x666666);
  }

  private renderModules(x: number, y: number, width: number, height: number): void {
    const itemHeight = 24;
    const maxVisible = Math.floor(height / itemHeight);
    this.maxScroll = Math.max(0, this.availableModules.length - maxVisible);

    let currentY = y;
    let lastRail = '';

    for (let i = this.scrollOffset; i < this.availableModules.length; i++) {
      if (currentY + itemHeight > y + height) break;

      const shopModule = this.availableModules[i];
      const module = shopModule.module;

      // Draw rail separator
      if (module.rail !== lastRail) {
        if (lastRail !== '') currentY += 4; // Add spacing
        BitmapFont.drawText(this.graphics, `-- ${module.rail} --`, x, currentY, 0x666666);
        currentY += 10;
        lastRail = module.rail;
      }

      const isSelected = i === this.selectedIndex;
      this.drawModuleItem(module, shopModule.price, shopModule.available, x, currentY, width, isSelected);
      currentY += itemHeight;
    }

    // Scroll indicator
    if (this.maxScroll > 0) {
      const scrollText = `${this.scrollOffset + 1}/${this.availableModules.length}`;
      BitmapFont.drawText(this.graphics, scrollText, x + width - 20, y, 0x666666);
    }
  }

  private drawModuleItem(
    module: Module,
    price: number,
    available: boolean,
    x: number,
    y: number,
    width: number,
    isSelected: boolean
  ): void {
    const canAfford = this.credits >= price;
    const canPurchase = available && canAfford && this.ownedModules.length < MAX_MODULE_SLOTS;

    // Background with selection highlight
    let bgColor = canPurchase ? 0x1a1a1a : 0x0a0a0a;
    if (isSelected) {
      bgColor = canPurchase ? 0x2a4a5a : 0x1a2a3a;
    }
    this.graphics.beginFill(bgColor);
    this.graphics.drawRect(snap(x), snap(y), width, 22);
    this.graphics.endFill();

    // Selection border
    if (isSelected) {
      this.graphics.lineStyle(1, 0x00e0ff);
      this.graphics.drawRect(snap(x), snap(y), width, 22);
      this.graphics.lineStyle(0);
    }

    // Name
    const nameColor = canPurchase ? 0x00e0ff : available ? 0x666666 : 0x333333;
    BitmapFont.drawText(this.graphics, module.name, x + 2, y + 2, nameColor);

    // Description (smaller)
    const descColor = 0x999999;
    BitmapFont.drawText(this.graphics, module.text, x + 2, y + 10, descColor, 0.8);

    // Price
    const priceText = available ? `${price}C` : 'OWNED';
    const priceColor = available ? (canAfford ? 0xffbd2e : 0xff6b6b) : 0x96f03c;
    BitmapFont.drawText(
      this.graphics,
      priceText,
      x + width - priceText.length * 4 - 2,
      y + 2,
      priceColor
    );
  }

  private renderVariants(x: number, y: number, width: number, height: number): void {
    const itemHeight = 20;
    const maxVisible = Math.floor(height / itemHeight);
    this.maxScroll = Math.max(0, this.availableVariants.length - maxVisible);

    let currentY = y;

    for (let i = this.scrollOffset; i < this.availableVariants.length; i++) {
      if (currentY + itemHeight > y + height) break;

      const shopVariant = this.availableVariants[i];
      const isSelected = i === this.selectedIndex;
      this.drawVariantItem(
        shopVariant.variant,
        shopVariant.price,
        shopVariant.available,
        x,
        currentY,
        width,
        isSelected
      );
      currentY += itemHeight;
    }

    // Scroll indicator
    if (this.maxScroll > 0) {
      const scrollText = `${this.scrollOffset + 1}/${this.availableVariants.length}`;
      BitmapFont.drawText(this.graphics, scrollText, x + width - 20, y, 0x666666);
    }
  }

  private drawVariantItem(
    variant: PieceVariant,
    price: number,
    available: boolean,
    x: number,
    y: number,
    width: number,
    isSelected: boolean
  ): void {
    const canAfford = this.credits >= price;
    const canPurchase = available && canAfford;

    // Background with selection highlight
    let bgColor = canPurchase ? 0x1a1a1a : 0x0a0a0a;
    if (isSelected) {
      bgColor = canPurchase ? 0x2a4a5a : 0x1a2a3a;
    }
    this.graphics.beginFill(bgColor);
    this.graphics.drawRect(snap(x), snap(y), width, 18);
    this.graphics.endFill();

    // Selection border
    if (isSelected) {
      this.graphics.lineStyle(1, 0x00e0ff);
      this.graphics.drawRect(snap(x), snap(y), width, 18);
      this.graphics.lineStyle(0);
    }

    // Name
    const name = `${variant.shape}-PIECE (${variant.badge})`;
    const nameColor = canPurchase ? 0x00e0ff : available ? 0x666666 : 0x333333;
    BitmapFont.drawText(this.graphics, name, x + 2, y + 2, nameColor);

    // Badge description
    const badgeDesc = `+${(variant.weight * 100).toFixed(0)}% SPAWN RATE`;
    BitmapFont.drawText(this.graphics, badgeDesc, x + 2, y + 10, 0x999999, 0.8);

    // Price
    const priceText = available ? `${price}C` : 'OWNED';
    const priceColor = available ? (canAfford ? 0xffbd2e : 0xff6b6b) : 0x96f03c;
    BitmapFont.drawText(
      this.graphics,
      priceText,
      x + width - priceText.length * 4 - 2,
      y + 2,
      priceColor
    );
  }

  getContainer(): PIXI.Container {
    return this.container;
  }

  destroy(): void {
    this.container.destroy({ children: true });
  }
}
