export type CompilationType = 'marketing' | 'market-intel' | 'product-strategy'

export const keyFactory = {
  compiled: (type: CompilationType, productId: string): string =>
    `bn:compiled:${type}:${productId}`,
  count: (type: CompilationType, productId: string): string =>
    `bn:count:${type}:${productId}`,
}


