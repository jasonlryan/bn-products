export type Visibility = 'public' | 'internal';
export type Priority = 'high' | 'medium' | 'low';
export type ReviewStatus = 'pending' | 'in_review' | 'approved';

export interface StageMetadata {
  category: string;
  priority: Priority;
  reviewStatus: ReviewStatus;
}

export interface Stage {
  file: string;
  visibility: Visibility;
  order: number;
  metadata?: StageMetadata;
}

export interface Product {
  id: string;
  name: string;
  visibility: {
    public: string[];
    internal: string[];
  };
  stages: {
    [key: string]: Stage;
  };
}

export interface GlobalSettings {
  defaultVisibility: Visibility;
  publicSections: string[];
  displayOrder: string[];
  categories: string[];
}

export interface DashboardConfig {
  products: {
    [key: string]: Product;
  };
  globalSettings: GlobalSettings;
}

// Helper functions for working with the config
export const isPublicSection = (
  config: DashboardConfig,
  sectionName: string
): boolean => {
  return config.globalSettings.publicSections.includes(sectionName);
};

export const getProductStages = (
  config: DashboardConfig,
  productKey: string
): Stage[] => {
  const product = config.products[productKey];
  if (!product) return [];

  return Object.entries(product.stages)
    .map(([_, stage]) => stage)
    .sort((a, b) => a.order - b.order);
};

export const getVisibleStages = (
  config: DashboardConfig,
  productKey: string,
  viewMode: Visibility
): Stage[] => {
  const stages = getProductStages(config, productKey);
  return stages.filter(stage => 
    viewMode === 'internal' || stage.visibility === 'public'
  );
}; 