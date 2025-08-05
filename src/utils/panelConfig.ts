export interface PanelState {
  id: string;
  isCollapsed: boolean;
  order: number;
}

export interface TabConfig {
  [tabId: string]: PanelState[];
}

export interface ProductConfig {
  [productId: string]: TabConfig;
}

const STORAGE_KEY = 'bn-product-panel-config';

export class PanelConfigManager {
  private config: ProductConfig = {};

  constructor() {
    this.loadConfig();
  }

  private loadConfig(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.config = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load panel config from localStorage:', error);
      this.config = {};
    }
  }

  private saveConfig(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config));
    } catch (error) {
      console.warn('Failed to save panel config to localStorage:', error);
    }
  }

  getPanelStates(productId: string, tabId: string): PanelState[] {
    return this.config[productId]?.[tabId] || [];
  }

  setPanelStates(productId: string, tabId: string, panelStates: PanelState[]): void {
    if (!this.config[productId]) {
      this.config[productId] = {};
    }
    this.config[productId][tabId] = panelStates;
    this.saveConfig();
  }

  updatePanelOrder(productId: string, tabId: string, panelIds: string[]): void {
    const currentStates = this.getPanelStates(productId, tabId);
    const stateMap = new Map(currentStates.map(state => [state.id, state]));
    
    const newStates: PanelState[] = panelIds.map((id, index) => ({
      id,
      isCollapsed: stateMap.get(id)?.isCollapsed || false,
      order: index
    }));

    this.setPanelStates(productId, tabId, newStates);
  }

  updatePanelCollapsed(productId: string, tabId: string, panelId: string, isCollapsed: boolean): void {
    const currentStates = this.getPanelStates(productId, tabId);
    const existingStateIndex = currentStates.findIndex(state => state.id === panelId);
    
    if (existingStateIndex >= 0) {
      currentStates[existingStateIndex].isCollapsed = isCollapsed;
    } else {
      currentStates.push({
        id: panelId,
        isCollapsed,
        order: currentStates.length
      });
    }

    this.setPanelStates(productId, tabId, currentStates);
  }

  getPanelCollapsedState(productId: string, tabId: string, panelId: string): boolean {
    const states = this.getPanelStates(productId, tabId);
    const state = states.find(s => s.id === panelId);
    return state?.isCollapsed || false;
  }

  getOrderedPanelIds(productId: string, tabId: string, defaultPanelIds: string[]): string[] {
    const states = this.getPanelStates(productId, tabId);
    
    if (states.length === 0) {
      return defaultPanelIds;
    }

    // Sort by order, then add any new panels that aren't in the saved state
    const orderedIds = states
      .sort((a, b) => a.order - b.order)
      .map(state => state.id)
      .filter(id => defaultPanelIds.includes(id));

    // Add any new panels that aren't in the saved state
    const newPanels = defaultPanelIds.filter(id => !orderedIds.includes(id));
    
    return [...orderedIds, ...newPanels];
  }

  resetProductConfig(productId: string): void {
    delete this.config[productId];
    this.saveConfig();
  }

  resetTabConfig(productId: string, tabId: string): void {
    if (this.config[productId]) {
      delete this.config[productId][tabId];
      this.saveConfig();
    }
  }

  exportConfig(): string {
    return JSON.stringify(this.config, null, 2);
  }

  importConfig(configJson: string): boolean {
    try {
      const imported = JSON.parse(configJson);
      this.config = imported;
      this.saveConfig();
      return true;
    } catch (error) {
      console.error('Failed to import config:', error);
      return false;
    }
  }
}

// Singleton instance
export const panelConfigManager = new PanelConfigManager(); 