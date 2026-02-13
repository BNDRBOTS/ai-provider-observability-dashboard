import { Handler, schedule } from '@netlify/functions'
import crypto from 'crypto'
import fs from 'fs/promises'
import path from 'path'

interface StockData {
  symbol: string
  price: number | null
  change: number | null
  changePercent: number | null
  volume: number | null
  timestamp: number
  source: 'polygon' | 'unavailable'
  error?: string
}

interface LitigationData {
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

interface SECFiling {
  filingDate: string
  formType: string
  company: string
  mentions: number
  url: string
  cik: string
}

interface HealthCheck {
  provider: string
  status: 'operational' | 'degraded' | 'unreachable'
  responseTime: number
  timestamp: number
  endpoint: string
  error?: string
}

interface DataHash {
  name: string
  hash: string
  timestamp: number
  size: number
}

function generateHash(data: any): string {
  const jsonString = JSON.stringify(data, null, 0)
  return crypto.createHash('sha256').update(jsonString).digest('hex')
}

async function fetchGoogleStock(): Promise<StockData> {
  const apiKey = process.env.POLYGON_API_KEY
  
  if (!apiKey) {
    return {
      symbol: 'GOOGL',
      price: null,
      change: null,
      changePercent: null,
      volume: null,
      timestamp: Date.now(),
      source: 'unavailable',
      error: 'API key not configured'
    }
  }
  
  try {
    const response = await fetch(
      `https://api.polygon.io/v2/aggs/ticker/GOOGL/prev?apiKey=${apiKey}`
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
        error: 'No data returned'
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

async function fetchLitigationData(companyName: string): Promise<LitigationData> {
  try {
    const response = await fetch(
      `https://www.courtlistener.com/api/rest/v3/search/?q=${encodeURIComponent(companyName)}&type=r&order_by=dateFiled%20desc`
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

async function fetchSECFilings(searchTerm: string): Promise<SECFiling[]> {
  try {
    const response = await fetch(
      'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001652044&type=&dateb=&owner=exclude&count=40&output=atom',
      {
        headers: {
          'User-Agent': 'AI-Provider-Observatory contact@example.com'
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

async function performHealthCheck(provider: string, endpoint: string): Promise<HealthCheck> {
  const startTime = Date.now()
  
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)
    
    const response = await fetch(endpoint, {
      method: 'GET',
      signal: controller.signal
    })
    
    clearTimeout(timeout)
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

const handler: Handler = async (event, context) => {
  console.log('Starting scheduled data fetch...')
  
  const publicDataDir = path.join(process.cwd(), 'public', 'data')
  
  try {
    await fs.mkdir(publicDataDir, { recursive: true })
  } catch (error) {
    console.error('Failed to create data directory:', error)
  }
  
  const hashes: DataHash[] = []
  
  // Fetch stock data
  console.log('Fetching stock data...')
  const stockData = await fetchGoogleStock()
  const stockJson = JSON.stringify(stockData, null, 2)
  const stockPath = path.join(publicDataDir, 'stock-data.json')
  await fs.writeFile(stockPath, stockJson)
  hashes.push({
    name: 'stock-data.json',
    hash: generateHash(stockData),
    timestamp: Date.now(),
    size: Buffer.byteLength(stockJson)
  })
  console.log('Stock data saved')
  
  // Fetch litigation data
  console.log('Fetching litigation data...')
  const litigationData = await fetchLitigationData('OpenAI')
  const litigationJson = JSON.stringify(litigationData, null, 2)
  const litigationPath = path.join(publicDataDir, 'litigation-data.json')
  await fs.writeFile(litigationPath, litigationJson)
  hashes.push({
    name: 'litigation-data.json',
    hash: generateHash(litigationData),
    timestamp: Date.now(),
    size: Buffer.byteLength(litigationJson)
  })
  console.log('Litigation data saved')
  
  // Fetch SEC filings
  console.log('Fetching SEC filings...')
  const secFilings = await fetchSECFilings('artificial intelligence')
  const secJson = JSON.stringify(secFilings, null, 2)
  const secPath = path.join(publicDataDir, 'sec-filings.json')
  await fs.writeFile(secPath, secJson)
  hashes.push({
    name: 'sec-filings.json',
    hash: generateHash(secFilings),
    timestamp: Date.now(),
    size: Buffer.byteLength(secJson)
  })
  console.log('SEC filings saved')
  
  // Perform health checks
  console.log('Performing health checks...')
  const healthChecks = await Promise.all([
    performHealthCheck('OpenAI', 'https://api.openai.com/v1/models'),
    performHealthCheck('Anthropic', 'https://api.anthropic.com/v1/messages'),
  ])
  const healthJson = JSON.stringify(healthChecks, null, 2)
  const healthPath = path.join(publicDataDir, 'health-checks.json')
  await fs.writeFile(healthPath, healthJson)
  hashes.push({
    name: 'health-checks.json',
    hash: generateHash(healthChecks),
    timestamp: Date.now(),
    size: Buffer.byteLength(healthJson)
  })
  console.log('Health checks saved')
  
  // Write hash manifest
  const manifest = {
    generated: new Date().toISOString(),
    hashes
  }
  const manifestJson = JSON.stringify(manifest, null, 2)
  const manifestPath = path.join(publicDataDir, 'hash-manifest.json')
  await fs.writeFile(manifestPath, manifestJson)
  console.log('Hash manifest saved')
  
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Data fetch completed successfully',
      filesGenerated: hashes.length + 1,
      timestamp: new Date().toISOString()
    })
  }
}

export { handler }
