import useSWR from 'swr'
import type { ProductDefinition } from '../services/storage/types'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function useProducts() {
  const { data, error, isLoading, mutate } = useSWR('/api/products', fetcher)
  
  return {
    products: (data?.products || []) as ProductDefinition[],
    error,
    isLoading,
    refetch: mutate
  }
}

export function useProduct(productId: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    productId ? `/api/products/${productId}` : null,
    fetcher
  )
  
  return {
    product: data as ProductDefinition | undefined,
    error,
    isLoading,
    refetch: mutate
  }
}

export function useProductContent(productId: string | null, contentType?: string) {
  const endpoint = contentType 
    ? `/api/products/${productId}/content/${contentType}`
    : `/api/products/${productId}/content`
  
  const { data, error, isLoading, mutate } = useSWR(
    productId ? endpoint : null,
    fetcher
  )
  
  return {
    content: data,
    error,
    isLoading,
    refetch: mutate
  }
}

// Mutation hooks for creating/updating products
export async function createProduct(product: Omit<ProductDefinition, 'id' | 'metadata'>) {
  const response = await fetch('/api/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(product),
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create product')
  }
  
  return response.json()
}

export async function updateProduct(productId: string, updates: Partial<ProductDefinition>) {
  const response = await fetch(`/api/products/${productId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to update product')
  }
  
  return response.json()
}

export async function deleteProduct(productId: string) {
  const response = await fetch(`/api/products/${productId}`, {
    method: 'DELETE',
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to delete product')
  }
  
  return response.json()
}

export async function cloneProduct(productId: string, newName: string) {
  const response = await fetch(`/api/products/${productId}/clone`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name: newName }),
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to clone product')
  }
  
  return response.json()
}