/**
 * Text cleaning utilities to fix formatting issues in product data
 */

/**
 * Clean text by replacing bullet points with hyphens and fixing spacing
 */
export function cleanText(text: string): string {
  if (!text) return '';
  
  return text
    // Replace bullet points with hyphens
    .replace(/•/g, '-')
    // Fix spacing around hyphens (remove spaces before, ensure space after)
    .replace(/\s*-\s*/g, '-')
    // Add space after hyphens when followed by letters
    .replace(/-([a-zA-Z])/g, '- $1')
    // Clean up multiple spaces
    .replace(/\s+/g, ' ')
    // Trim whitespace
    .trim();
}

/**
 * Clean product name specifically
 */
export function cleanProductName(name: string): string {
  if (!name) return '';
  
  return cleanText(name)
    // Handle trademark symbols properly
    .replace(/- ™/g, '™')
    .replace(/- \(TM\)/g, '™');
}

/**
 * Clean description text with better sentence flow
 */
export function cleanDescription(description: string): string {
  if (!description) return '';
  
  return cleanText(description)
    // Fix common phrase patterns
    .replace(/- track/g, '-track')
    .replace(/- house/g, '-house')
    .replace(/- wide/g, '-wide')
    .replace(/- led/g, '-led')
    .replace(/- on/g, '-on')
    .replace(/- up/g, '-up')
    // Fix repetitive phrases
    .replace(/(.+?)\.\s*\1/g, '$1')
    // Clean up extra periods and spaces
    .replace(/\.\s*\./g, '.')
    .replace(/\s+/g, ' ')
    .trim();
} 