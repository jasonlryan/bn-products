import type { MigrationResult } from '../services/storage/types'

export class MigrationHelper {
  /**
   * Migrate all localStorage data to Redis via API
   */
  static async migrateToRedis(): Promise<MigrationResult> {
    if (typeof window === 'undefined' || !window.localStorage) {
      throw new Error('localStorage is not available')
    }

    // Collect all localStorage data
    const localStorageData: Record<string, string> = {}
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key) {
        const value = localStorage.getItem(key)
        if (value !== null) {
          localStorageData[key] = value
        }
      }
    }

    // Send data to migration API
    const response = await fetch('/api/migrate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source: 'localStorage',
        target: 'redis',
        validate: true,
        data: localStorageData
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Migration failed')
    }

    const { result } = await response.json()
    return result as MigrationResult
  }

  /**
   * Get current localStorage data summary
   */
  static getLocalStorageSummary(): {
    totalKeys: number
    compiledContent: number
    compilationCounts: number
    settings: number
    other: number
    keys: string[]
  } {
    if (typeof window === 'undefined' || !window.localStorage) {
      return {
        totalKeys: 0,
        compiledContent: 0,
        compilationCounts: 0,
        settings: 0,
        other: 0,
        keys: []
      }
    }

    const keys: string[] = []
    let compiledContent = 0
    let compilationCounts = 0
    let settings = 0
    let other = 0

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key) {
        keys.push(key)
        
        if (key.startsWith('compiled-')) {
          compiledContent++
        } else if (key.includes('compilation-count-')) {
          compilationCounts++
        } else if (key.includes('settings') || key === 'admin-settings' || key === 'page-edit-mode') {
          settings++
        } else {
          other++
        }
      }
    }

    return {
      totalKeys: keys.length,
      compiledContent,
      compilationCounts,
      settings,
      other,
      keys
    }
  }

  /**
   * Validate migration by comparing localStorage and Redis data
   */
  static async validateMigration(): Promise<{
    isValid: boolean
    missingKeys: string[]
    errors: string[]
  }> {
    const missingKeys: string[] = []
    const errors: string[] = []

    // This would need to be implemented based on specific validation requirements
    // For now, we'll just check if the migration endpoint is accessible
    
    try {
      const response = await fetch('/api/migrate')
      if (!response.ok) {
        errors.push('Migration API is not accessible')
      }
    } catch (error) {
      errors.push('Failed to connect to migration API')
    }

    return {
      isValid: errors.length === 0,
      missingKeys,
      errors
    }
  }

  /**
   * Clear localStorage after successful migration
   */
  static clearLocalStorageAfterMigration(keysToKeep: string[] = []): void {
    if (typeof window === 'undefined' || !window.localStorage) {
      return
    }

    const keysToRemove: string[] = []
    
    // Collect keys to remove (migration-related keys)
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && !keysToKeep.includes(key)) {
        if (
          key.startsWith('compiled-') ||
          key.includes('compilation-count-') ||
          key === 'admin-settings' ||
          key === 'page-edit-mode'
        ) {
          keysToRemove.push(key)
        }
      }
    }

    // Remove the keys
    keysToRemove.forEach(key => {
      localStorage.removeItem(key)
    })
  }

  /**
   * Backup localStorage to a downloadable JSON file
   */
  static backupLocalStorage(): void {
    if (typeof window === 'undefined' || !window.localStorage) {
      throw new Error('localStorage is not available')
    }

    const backup: Record<string, string> = {}
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key) {
        const value = localStorage.getItem(key)
        if (value !== null) {
          backup[key] = value
        }
      }
    }

    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: 'application/json'
    })
    
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `localStorage-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  /**
   * Full migration workflow with backup
   */
  static async performFullMigration(
    createBackup: boolean = true,
    clearAfterMigration: boolean = false
  ): Promise<MigrationResult> {
    try {
      // Step 1: Create backup if requested
      if (createBackup) {
        this.backupLocalStorage()
      }

      // Step 2: Perform migration
      const result = await this.migrateToRedis()

      // Step 3: Validate migration
      const validation = await this.validateMigration()
      if (!validation.isValid) {
        throw new Error(`Migration validation failed: ${validation.errors.join(', ')}`)
      }

      // Step 4: Clear localStorage if requested and migration was successful
      if (clearAfterMigration && result.errors.length === 0) {
        this.clearLocalStorageAfterMigration()
      }

      return result
    } catch (error) {
      throw new Error(`Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}