import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function useAdminSettings() {
  const { data, error, isLoading, mutate } = useSWR('/api/settings/admin', fetcher)
  
  return {
    settings: data?.settings,
    error,
    isLoading,
    refetch: mutate
  }
}

export function useEditMode() {
  const { data, error, isLoading, mutate } = useSWR('/api/settings/edit-mode', fetcher)
  
  return {
    editMode: data?.editMode || false,
    error,
    isLoading,
    refetch: mutate
  }
}

export function usePrompts() {
  const { data, error, isLoading, mutate } = useSWR('/api/settings/prompts', fetcher)
  
  return {
    prompts: data?.prompts,
    error,
    isLoading,
    refetch: mutate
  }
}

// Mutation hooks for settings
export async function updateAdminSettings(settings: any) {
  const response = await fetch('/api/settings/admin', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(settings),
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to update admin settings')
  }
  
  return response.json()
}

export async function setEditMode(editMode: boolean) {
  const response = await fetch('/api/settings/edit-mode', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ editMode }),
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to update edit mode')
  }
  
  return response.json()
}

export async function updatePrompts(prompts: any) {
  const response = await fetch('/api/settings/prompts', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(prompts),
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to update prompts')
  }
  
  return response.json()
}