/**
 * Product Config Adapter
 * 
 * Loads product data from product-config.json and adapts it to the format
 * expected by the React dashboard components.
 */

import type { Product, RichContentFile } from '../types/product';
import productConfigData from '../../config/product-config-master.json';

// Type for the config file structure (matches our CSV extraction format)
interface ProductConfigFile {
  metadata: {
    extractedFrom: string;
    extractedAt: string;
    totalProducts: number;
    totalProductFiles: number;
    source: string;
    productsSource: string;
    version: string;
  };
  products: {
    [key: string]: {
      id: string;
      name: string;
      type: "PRODUCT" | "SERVICE";
      pricing: {
        type: string;
        display: string;
        options?: Array<{
          name: string;
          price: string;
        }>;
      };
      content: {
        heroTitle: string;
        heroSubtitle: string;
        description: string;
        primaryDeliverables: string;
        perfectFor: string;
        whatClientBuys: string;
        idealClient: string;
        nextProduct: string;
      };
      features: string[];
      benefits: string[];
      perfectForList: string[];
      marketing: {
        tagline: string;
        valueProposition: string;
        keyMessages: string[];
      };
      richContent: {
        manifesto?: RichContentFile;
        functionalSpec?: RichContentFile;
        audienceICPs?: RichContentFile;
        userStories?: RichContentFile;
        competitorAnalysis?: RichContentFile;
        marketSizing?: RichContentFile;
        prdSkeleton?: RichContentFile;
        uiPrompt?: RichContentFile;
        screenGeneration?: RichContentFile;
        landingPageCopy?: RichContentFile;
        keyMessages?: RichContentFile;
        investorDeck?: RichContentFile;
        demoScript?: RichContentFile;
        slideHeadlines?: RichContentFile;
        qaPrep?: RichContentFile;
      };
      metadata: {
        extractedAt: string;
        source: string;
        editable: boolean;
        lastModified: string;
        richContentFiles: number;
      };
    };
  };
}

const configData = productConfigData as ProductConfigFile;

/**
 * Transform raw config data to Product interface
 */
function transformToProduct(rawProduct: any): Product {
  return {
    id: rawProduct.id,
    name: rawProduct.name,
    type: rawProduct.type,
    pricing: {
      type: rawProduct.pricing?.type || "contact",
      display: rawProduct.pricing?.display || "Contact for Pricing",
      options: rawProduct.pricing?.options
    },
    content: {
      heroTitle: rawProduct.content?.heroTitle,
      heroSubtitle: rawProduct.content?.heroSubtitle,
      description: rawProduct.content?.description || "",
      perfectFor: rawProduct.content?.perfectFor || "",
      primaryDeliverables: rawProduct.content?.primaryDeliverables,
      whatClientBuys: rawProduct.content?.whatClientBuys,
      idealClient: rawProduct.content?.idealClient,
      nextProduct: rawProduct.content?.nextProduct,
    },
    features: rawProduct.features || [],
    benefits: rawProduct.benefits || [],
    perfectForList: rawProduct.perfectForList || [],
    marketing: {
      keyMessages: rawProduct.marketing?.keyMessages || [],
      valueProposition: rawProduct.marketing?.valueProposition,
      tagline: rawProduct.marketing?.tagline,
    },
    metadata: rawProduct.metadata,
    richContent: rawProduct.richContent || {}
  };
}

/**
 * Get all products from the configuration
 */
export function getAllProducts(): Product[] {
  return Object.values(configData.products)
    .filter(item => item.type === 'PRODUCT')
    .map(transformToProduct);
}

/**
 * Get all services from the configuration
 */
export function getAllServices(): Product[] {
  return Object.values(configData.products)
    .filter(item => item.type === 'SERVICE')
    .map(transformToProduct);
}

/**
 * Get all products and services combined
 */
export function getAllProductsAndServices(): Product[] {
  return Object.values(configData.products).map(transformToProduct);
}

/**
 * Get a specific product by ID
 */
export function getProductById(id: string): Product | undefined {
  const rawProduct = configData.products[id];
  if (!rawProduct) {
    return undefined;
  }
  return transformToProduct(rawProduct);
}

/**
 * Get configuration metadata
 */
export const CONFIG_METADATA = configData.metadata; 