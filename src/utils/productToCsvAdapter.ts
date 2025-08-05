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
    // Special handling for clearly fragmented items
    const reconstructed: string[] = [];
    let currentItem = '';
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i].trim();
      if (!item) continue;
      
      currentItem += (currentItem ? ' ' : '') + item;
      
      // Check if this looks like a complete benefit/feature item
      const isCompleteItem = 
        // Item ends with a complete word/concept
        (item.match(/\w+$/) && 
         // Next item starts with capital letter (new item) or we're at the end
         (i === items.length - 1 || items[i + 1]?.trim().match(/^[A-Z]/)) &&
         // Current accumulated item has substance (not just fragments)
         currentItem.length > 10) ||
        // Or this is the last item
        (i === items.length - 1);
      
      if (isCompleteItem) {
        reconstructed.push(currentItem.trim());
        currentItem = '';
      }
    }
    
    // Handle any remaining text
    if (currentItem.trim()) {
      reconstructed.push(currentItem.trim());
    }
    
    // If reconstruction didn't help much, try a different approach
    if (reconstructed.length === items.length) {
      // Look for obvious fragments that should be joined
      const regrouped: string[] = [];
      let accumulator = '';
      
      for (let i = 0; i < items.length; i++) {
        const item = items[i].trim();
        accumulator += (accumulator ? ' ' : '') + item;
        
        // Check if we should end this group
        const shouldEnd = 
          // This item ends with a meaningful word and next starts with capital
          (i < items.length - 1 && 
           item.match(/[a-zA-Z]{3,}$/) && 
           items[i + 1]?.trim().match(/^[A-Z][a-z]/)) ||
          // Or we're at the end
          (i === items.length - 1) ||
          // Or current accumulator is getting very long (likely multiple items)
          (accumulator.length > 60);
        
        if (shouldEnd) {
          regrouped.push(accumulator.trim());
          accumulator = '';
        }
      }
      
      // Use whichever gives us more reasonable results
      return regrouped.length < items.length && regrouped.length > 0 ? regrouped : reconstructed;
    }
    
    return reconstructed
      .map(item => item.trim())
      .filter(item => item.length > 0);
  }
  
  // If it's a string, split it appropriately
  return items.split(/[•·\n]/)
    .map(item => item.trim())
    .filter(item => item.length > 0)
    .map(item => item.replace(/^[•·\-\*]\s*/, ''));
} 