import type { CSVProduct } from '../types/landing-page';
import type { Product } from '../types/product';

/**
 * Convert existing Product type to CSVProduct format for landing page
 */
export function productToCSVProduct(product: Product): CSVProduct {
  const parsedFeatures = parseListItems(product.features || []);
  const parsedBenefits = parseListItems(product.benefits || []);
  
  return {
    Type: product.type || 'PRODUCT',
    NAME: product.name || '',
    PRICE: product.pricing?.display || 'Contact for Pricing',
    'Primary Deliverables': product.content?.primaryDeliverables || '',
    DESCRIPTION: product.content?.description || product.content?.heroSubtitle || '',
    'WHAT IS THE NEXT PRODUCT OR SERVICE?': product.content?.nextProduct || '',
    'PERFECT FOR:': (product as any).perfectForList 
      ? parseListItems((product as any).perfectForList).join(', ')
      : product.content?.perfectFor || '',
    'WHAT THE CLIENT IS ACTUALLY BUYING': product.content?.whatClientBuys || '',
    'IDEAL CLIENT': product.content?.idealClient || '',
    'KEY FEATURES': parsedFeatures,
    BENEFITS: parsedBenefits
  };
}

function parseListItems(items: string | string[]): string[] {
  if (!items) return [];
  
  // If it's already an array, we need to check if items were fragmented during parsing
  if (Array.isArray(items)) {
    // Join obvious fragments that resulted from incorrect splitting
    const joined: string[] = [];
    let buffer = '';
    const flush = () => {
      if (buffer.trim()) joined.push(buffer.trim());
      buffer = '';
    };
    for (let i = 0; i < items.length; i++) {
      const token = (items[i] || '').trim();
      if (!token) continue;
      // If token is very short or clearly a continuation, append to buffer
      const isFragment = token.split(' ').length <= 2 && token.toLowerCase() === token;
      buffer += (buffer ? ' ' : '') + token;
      // If next token starts with uppercase and current buffer seems complete, flush
      const next = (items[i + 1] || '').trim();
      const nextStartsNew = next && /^[A-Z]/.test(next);
      if (!isFragment || nextStartsNew || i === items.length - 1) {
        flush();
      }
    }
    return joined;
  }
  
  // If it's a string, split it appropriately
  return items.split(/[•·\n]/)
    .map(item => item.trim())
    .filter(item => item.length > 0)
    .map(item => item.replace(/^[•·\-\*]\s*/, ''));
} 