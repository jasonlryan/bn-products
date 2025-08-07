import useSWR from 'swr'
import type { PipelineStatus } from '../services/storage/types'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function usePipelineStatus(productId: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    productId ? `/api/pipeline/status/${productId}` : null,
    fetcher,
    {
      refreshInterval: 5000, // Poll every 5 seconds for status updates
      revalidateOnFocus: true
    }
  )
  
  return {
    status: data as PipelineStatus | undefined,
    error,
    isLoading,
    refetch: mutate
  }
}

export function usePipelineQueue() {
  const { data, error, isLoading, mutate } = useSWR('/api/pipeline/queue', fetcher, {
    refreshInterval: 10000, // Poll every 10 seconds for queue updates
    revalidateOnFocus: true
  })
  
  return {
    queue: data?.queue || [],
    count: data?.count || 0,
    error,
    isLoading,
    refetch: mutate
  }
}

// Mutation hooks for pipeline operations
export async function triggerContentGeneration(
  productId: string,
  contentTypes: string[],
  regenerate: boolean = false
) {
  const response = await fetch('/api/pipeline/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      productId,
      contentTypes,
      regenerate
    }),
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to trigger content generation')
  }
  
  return response.json()
}

// Hook to use pipeline operations with automatic status tracking
export function useContentGeneration() {
  const triggerGeneration = async (
    productId: string,
    contentTypes: string[],
    regenerate: boolean = false
  ) => {
    try {
      const result = await triggerContentGeneration(productId, contentTypes, regenerate)
      return result
    } catch (error) {
      throw error
    }
  }

  return {
    triggerGeneration
  }
}