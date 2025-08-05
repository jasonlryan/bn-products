/**
 * Main Configuration Index
 * 
 * Central export point for all product and service configurations.
 * Now powered by product-config.json for richer content management.
 */

import { 
  getAllProducts, 
  getAllServices, 
  getProductById, 
  getAllProductsAndServices
} from './product-config-adapter';
import type { Product } from '../types/product';

// Export the adapter functions
export {
  getAllProducts,
  getAllServices,
  getProductById,
  getAllProductsAndServices
} from './product-config-adapter';

// Legacy compatibility - maintain existing API
export const PRODUCTS_CONFIG: Product[] = getAllProducts();
export const SERVICES_CONFIG: Product[] = getAllServices();

// Combined configurations
export const ALL_PRODUCTS_AND_SERVICES: Product[] = getAllProductsAndServices();

// Utility functions for accessing configuration data
export const getProductsByType = (type: 'PRODUCT' | 'SERVICE'): Product[] => {
  return ALL_PRODUCTS_AND_SERVICES.filter(item => item.type === type);
};

// Content management utilities
export const getContentBySection = (productId: string, section: keyof Product) => {
  const product = getProductById(productId);
  return product ? product[section] : undefined;
};

export const getAllTaglines = (): string[] => {
  return ALL_PRODUCTS_AND_SERVICES
    .map(item => item.content.tagline)
    .filter(Boolean) as string[];
};

export const getAllKeyMessages = (): string[] => {
  return ALL_PRODUCTS_AND_SERVICES
    .flatMap(item => item.marketing.keyMessages);
};

export const getTestimonials = () => {
  return ALL_PRODUCTS_AND_SERVICES
    .map(item => item.socialProof?.testimonial)
    .filter(Boolean);
};

// SEO utilities
export const getAllSlugs = (): string[] => {
  return ALL_PRODUCTS_AND_SERVICES
    .map(item => item.seo?.slug || item.id)
    .filter(Boolean);
};

export const getMetaDataBySlug = (slug: string) => {
  const product = ALL_PRODUCTS_AND_SERVICES.find(
    item => (item.seo?.slug || item.id) === slug
  );
  return product?.seo;
};

// Rich content utilities (new!)
export const getManifestoContent = (productId: string) => {
  const product = getProductById(productId);
  return product?.richContent?.manifesto;
};

export const getAudienceICPs = (productId: string) => {
  const product = getProductById(productId);
  return product?.richContent?.audienceICPs;
};

export const getCompetitorAnalysis = (productId: string) => {
  const product = getProductById(productId);
  return product?.richContent?.competitorAnalysis;
};

export const getMarketSizing = (productId: string) => {
  const product = getProductById(productId);
  return product?.richContent?.marketSizing;
};

export const getUserStories = (productId: string) => {
  const product = getProductById(productId);
  return product?.richContent?.userStories;
};

export const getInvestorDeck = (productId: string) => {
  const product = getProductById(productId);
  return product?.richContent?.investorDeck;
}; 