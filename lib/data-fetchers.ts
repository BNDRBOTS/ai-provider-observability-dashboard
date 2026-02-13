import crypto from 'crypto'

export interface StockData {
  symbol: string
  price: number | null
  change: number | null
  changePercent: number | null
  volume: number | null
  timestamp: number
  source: 'polygon' | 'yahoo' | 'unavailable'
  error?: string
}

export interface LitigationData {
  query: string
  count: number
  date: string
  source: 'courtlistener'
  cases: Array<{
    docketNumber: string
    caseName: string
    court: string
    dateFiled: string
    url: string
  }>
}

export interface SECFiling {
  filingDate: string
  formType: string
  company: string
  mentions: number
  url: string
  cik: string
}

export interface HealthCheck {
  provider: string
  status: 'operational' | 'degraded' | 'unreachable'
  responseTime: number
  timestamp: number
  endpoint: string
  error?: string
}

export function generateHash(data: any): string {
  const jsonString = JSON.stringify(data, null, 0)
  return crypto.createHash('sha256').update(jsonString).digest('hex')
}

export async function fetchGoogleStock(): Promise<StockData> {
  const apiKey = process.env.NEXT_PUBLIC_POLYGON_API_KEY
  const useYahoo = process.env.NEXT_PUBLIC_USE_YAHOO_FINANCE === 'true'
  
  if (useYahoo) {
    return {
      symbol: 'GOOGL',
      price: null,
      change: null,
      changePercent: null,
      volume: null,
      timestamp: Date.now(),
      source: 'unavailable',
      error: 'Yahoo Finance integration requires external API proxy'
    }
  }
  
  if (!apiKey) {
    return {
      symbol: 'GOOGL',
      price: null,
      change: null,
      changePercent: null,
      volume: null,
      timestamp: Date.now(),
      source: 'unavailable',
      error: 'API key not configured. Set NEXT_PUBLIC_POLYGON_API_KEY in environment variables.'
    }
  }
  
  try {
    const response = await fetch(
      `https://api.polygon.io/v2/aggs/ticker/GOOGL/prev?apiKey=${apiKey}`,
      { next: { revalidate: 3600 } }
    )
    
    if (!response.ok) {
      throw new Error(`Polygon API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (!data.results || data.results.length === 0) {
      return {
        symbol: 'GOOGL',
        price: null,
        change: null,
        changePercent: null,
        volume: null,
        timestamp: Date.now(),
        source: 'polygon',
        error: 'No data returned from Polygon API'
      }
    }
    
    const result = data.results[0]
    
    return {
      symbol: 'GOOGL',
      price: result.c,
      change: result.c - result.o,
      changePercent: ((result.c - result.o) / result.o) * 100,
      volume: result.v,
      timestamp: Date.now(),
      source: 'polygon'
    }
  } catch (error) {
    return {
      symbol: 'GOOGL',
      price: null,
      change: null,
      changePercent: null,
      volume: null,
      timestamp: Date.now(),
      source: 'unavailable',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export async function fetchLitigationData(companyName: string): Promise<LitigationData> {
  try {
    const response = await fetch(
      `https://www.courtlistener.com/api/rest/v3/search/?q=${encodeURIComponent(companyName)}&type=r&order_by=dateFiled%20desc`,
      { 
        next: { revalidate: 86400 },
        headers: {
          'Accept': 'application/json'
        }
      }
    )
    
    if (!response.ok) {
      throw new Error(`CourtListener API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    const cases = (data.results || []).slice(0, 10).map((result: any) => ({
      docketNumber: result.docketNumber || 'N/A',
      caseName: result.caseName || 'Unknown',
      court: result.court || 'Unknown',
      dateFiled: result.dateFiled || 'Unknown',
      url: `https://www.courtlistener.com${result.absolute_url || ''}`
    }))
    
    return {
      query: companyName,
      count: data.count || 0,
      date: new Date().toISOString().split('T')[0],
      source: 'courtlistener',
      cases
    }
  } catch (error) {
    return {
      query: companyName,
      count: 0,
      date: new Date().toISOString().split('T')[0],
      source: 'courtlistener',
      cases: []
    }
  }
}

export async function fetchSECFilings(searchTerm: string): Promise<SECFiling[]> {
  try {
    const response = await fetch(
      'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001652044&type=&dateb=&owner=exclude&count=40&output=atom',
      {
        next: { revalidate: 86400 },
        headers: {
          'User-Agent': 'AI-Provider-Observatory contact@example.com',
          'Accept': 'application/atom+xml'
        }
      }
    )
    
    if (!response.ok) {
      return []
    }
    
    const xmlText = await response.text()
    const filings: SECFiling[] = []
    
    const entryRegex = /<entry>(.*?)<\/entry>/gs
    const entries = xmlText.match(entryRegex) || []
    
    for (const entry of entries.slice(0, 20)) {
      const filingDate = entry.match(/<filing-date>(.*?)<\/filing-date>/)?.[1] || ''
      const formType = entry.match(/<filing-type>(.*?)<\/filing-type>/)?.[1] || ''
      const company = entry.match(/<company-name>(.*?)<\/company-name>/)?.[1] || 'Alphabet Inc.'
      const url = entry.match(/<filing-href>(.*?)<\/filing-href>/)?.[1] || ''
      const cik = entry.match(/<cik>(.*?)<\/cik>/)?.[1] || '0001652044'
      
      const mentionCount = (entry.match(new RegExp(searchTerm, 'gi')) || []).length
      
      if (mentionCount > 0 || formType.includes('10-')) {
        filings.push({
          filingDate,
          formType,
          company,
          mentions: mentionCount,
          url,
          cik
        })
      }
    }
    
    return filings
  } catch (error) {
    return []
  }
}

export async function performHealthCheck(provider: string, endpoint: string): Promise<HealthCheck> {
  const startTime = Date.now()
  
  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      signal: AbortSignal.timeout(10000)
    })
    
    const responseTime = Date.now() - startTime
    
    if (response.ok) {
      return {
        provider,
        status: 'operational',
        responseTime,
        timestamp: Date.now(),
        endpoint
      }
    } else if (response.status >= 500) {
      return {
        provider,
        status: 'unreachable',
        responseTime,
        timestamp: Date.now(),
        endpoint,
        error: `Server error: ${response.status}`
      }
    } else {
      return {
        provider,
        status: 'degraded',
        responseTime,
        timestamp: Date.now(),
        endpoint,
        error: `HTTP ${response.status}`
      }
    }
  } catch (error) {
    const responseTime = Date.now() - startTime
    
    return {
      provider,
      status: 'unreachable',
      responseTime,
      timestamp: Date.now(),
      endpoint,
      error: error instanceof Error ? error.message : 'Network error'
    }
  }
}
