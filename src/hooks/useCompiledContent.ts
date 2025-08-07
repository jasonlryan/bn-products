import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function useCompiledContent(
  productId: string | null, 
  type: 'marketing' | 'market-intel' | 'product-strategy'
) {
  const { data, error, isLoading, mutate } = useSWR(
    productId ? `/api/compilation/${type}?productId=${productId}` : null,
    fetcher
  )
  
  return {
    content: data,
    error,
    isLoading,
    refetch: mutate
  }
}

export function useCompilationStatus(productId: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    productId ? `/api/compilation/status?productId=${productId}` : null,
    fetcher
  )
  
  return {
    status: data,
    error,
    isLoading,
    refetch: mutate
  }
}

// Mutation hooks for compilation operations
export async function saveCompiledContent(
  productId: string,
  type: 'marketing' | 'market-intel' | 'product-strategy',
  content: any
) {
  const response = await fetch(`/api/compilation/${type}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ productId, content }),
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to save compiled content')
  }
  
  return response.json()
}

export async function deleteCompiledContent(
  productId: string,
  type: 'marketing' | 'market-intel' | 'product-strategy'
) {
  const response = await fetch(`/api/compilation/${type}?productId=${productId}`, {
    method: 'DELETE',
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to delete compiled content')
  }
  
  return response.json()
}