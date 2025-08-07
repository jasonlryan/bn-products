import type { LandingPageData, CSVProduct } from '../types/landing-page';

/**
 * Parse bullet points or list items from text content
 * Handles both string input and array input
 */
function parseListItems(content: string | string[]): string[] {
  if (!content) return [];
  
  // If it's already an array, filter and clean it
  if (Array.isArray(content)) {
    return content
      .filter(item => item && item.trim && item.trim().length > 0)
      .map(item => item.trim())
      .slice(0, 6); // Limit to 6 items for UI purposes
  }
  
  // If it's a string, split by common bullet point patterns and clean up
  if (typeof content === 'string') {
    // Normalise line endings
    const normalised = content.replace(/\r\n/g, '\n');
    // Primary split on newlines; do NOT split on hyphens to avoid fragmenting phrases like "Real world solutions"
    let parts = normalised
      .split('\n')
      .map(part => part.replace(/^\s*[•*\-]\s*/, '')) // trim leading bullets if present
      .map(part => part.trim())
      .filter(part => part.length > 0);

    // If we still only have one big line, try splitting on bullet characters explicitly
    if (parts.length === 1) {
      parts = normalised
        .split(/[•·]/)
        .map(part => part.trim())
        .filter(part => part.length > 0);
    }

    // As a last resort, if commas/semicolons are used consistently, split on those
    if (parts.length === 1 && /[,;]\s+/.test(normalised)) {
      parts = normalised
        .split(/[,;]\s+/)
        .map(part => part.trim())
        .filter(part => part.length > 0);
    }

    return parts.slice(0, 6); // Limit to 6 items for UI purposes
  }
  
  return [];
}

/**
 * Clean and format text content
 */
function cleanText(text: string): string {
  if (!text) return '';
  return text.trim().replace(/\s+/g, ' ');
}

/**
 * Convert CSV product data to landing page structure
 */
export function csvToLandingPageData(csvProduct: CSVProduct): LandingPageData {
  // Handle the case where BENEFITS and KEY FEATURES might come as arrays from the adapter
  const benefits = parseListItems(csvProduct.BENEFITS);
  const features = parseListItems(csvProduct['KEY FEATURES']);
  const upsellContent = cleanText(csvProduct['WHAT IS THE NEXT PRODUCT OR SERVICE?']);

  return {
    hero: {
      headline: cleanText(csvProduct.NAME),
      subhead: cleanText(csvProduct.DESCRIPTION),
      badge: cleanText(csvProduct.Type).toUpperCase()
    },
    valueProposition: {
      title: "What You're Actually Buying",
      content: cleanText(csvProduct['WHAT THE CLIENT IS ACTUALLY BUYING'])
    },
    benefits: {
      title: "Key Benefits",
      items: benefits
    },
    features: {
      title: "Key Features", 
      items: features
    },
    perfectFor: {
      title: "Perfect For",
      primary: cleanText(csvProduct['PERFECT FOR:']),
      secondary: cleanText(csvProduct['IDEAL CLIENT'])
    },
    pricing: {
      price: cleanText(csvProduct.PRICE),
      deliverables: cleanText(csvProduct['Primary Deliverables']),
      ctaText: "Get Started",
      ctaLink: "#contact"
    },
    upsell: {
      title: "What's Next?",
      content: upsellContent,
      show: upsellContent.length > 0
    }
  };
}

/**
 * Load landing page data with localStorage overrides
 */
export function loadLandingPageData(
  csvProduct: CSVProduct, 
  productId: string
): LandingPageData {
  // Start with CSV data
  const baseData = csvToLandingPageData(csvProduct);
  
  // Apply any saved edits from localStorage
  const savedKey = `landing-page-${productId}`;
  const savedData = localStorage.getItem(savedKey);
  
  if (savedData) {
    try {
      const edits = JSON.parse(savedData);
      return mergeDeep(baseData, edits);
    } catch (error) {
      console.warn('Failed to parse saved landing page data:', error);
    }
  }
  
  return baseData;
}

/**
 * Save landing page edits to localStorage
 */
export function saveLandingPageData(
  data: LandingPageData, 
  productId: string
): void {
  const savedKey = `landing-page-${productId}`;
  localStorage.setItem(savedKey, JSON.stringify(data));
}

/**
 * Deep merge utility for applying edits
 */
function mergeDeep(target: any, source: any): any {
  const result = { ...target };
  
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = mergeDeep(target[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  
  return result;
} 