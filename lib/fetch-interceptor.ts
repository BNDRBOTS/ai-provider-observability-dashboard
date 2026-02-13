"use client"

import { saveUsageRecord, UsageRecord } from './indexeddb'

interface AIResponse {
  usage?: {
    prompt_tokens?: number
    completion_tokens?: number
    total_tokens?: number
  }
  model?: string
}

function extractProviderFromURL(url: string): string | null {
  if (url.includes('api.openai.com')) return 'OpenAI'
  if (url.includes('api.anthropic.com')) return 'Anthropic'
  if (url.includes('generativelanguage.googleapis.com')) return 'Google'
  if (url.includes('api.deepseek.com')) return 'DeepSeek'
  if (url.includes('api.x.ai')) return 'xAI (Grok)'
  return null
}

function generateRecordId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

export function installFetchInterceptor() {
  if (typeof window === 'undefined') return
  
  const originalFetch = window.fetch
  
  window.fetch = async function(...args: Parameters<typeof fetch>): Promise<Response> {
    const [resource, init] = args

    let url: string
    if (typeof resource === 'string') {
      url = resource
    } else if (resource instanceof URL) {
      url = resource.toString()
    } else if (typeof resource === 'object' && resource !== null && 'url' in resource) {
      url = (resource as Request).url
    } else {
      url = String(resource)
    }

    const startTime = Date.now()
    
    const provider = extractProviderFromURL(url)
    
    try {
      const response = await originalFetch(...args)
      
      if (provider && response.ok) {
        const clonedResponse = response.clone()
        
        try {
          const jsonData: AIResponse = await clonedResponse.json()
          
          if (jsonData.usage) {
            const record: UsageRecord = {
              id: generateRecordId(),
              timestamp: Date.now(),
              provider,
              model: jsonData.model || 'unknown',
              requestTokens: jsonData.usage.prompt_tokens || 0,
              responseTokens: jsonData.usage.completion_tokens || 0,
              totalTokens: jsonData.usage.total_tokens || 0,
              endpoint: url,
              responseTime: Date.now() - startTime
            }
            
            await saveUsageRecord(record)
          }
        } catch (parseError) {
          // Response not JSON or no usage data
        }
      }
      
      return response
    } catch (error) {
      throw error
    }
  }
}
