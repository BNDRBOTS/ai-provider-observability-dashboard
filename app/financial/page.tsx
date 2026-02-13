"use client"

import { useEffect, useState } from 'react'
import { StockTile } from '@/components/dashboard/stock-tile'
import { SECFilingTable } from '@/components/dashboard/sec-filing-table'
import { LitigationCard } from '@/components/dashboard/litigation-card'
import { StockData, LitigationData, SECFiling, fetchGoogleStock, fetchLitigationData, fetchSECFilings } from '@/lib/data-fetchers'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'

export default function FinancialPage() {
  const [stockData, setStockData] = useState<StockData | null>(null)
  const [litigationData, setLitigationData] = useState<LitigationData | null>(null)
  const [secFilings, setSecFilings] = useState<SECFiling[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadAllData = async () => {
    setIsLoading(true)
    
    const [stock, litigation, filings] = await Promise.all([
      fetchGoogleStock(),
      fetchLitigationData('OpenAI'),
      fetchSECFilings('artificial intelligence')
    ])

    setStockData(stock)
    setLitigationData(litigation)
    setSecFilings(filings)
    setIsLoading(false)
  }

  useEffect(() => {
    loadAllData()
  }, [])

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Financial & Legal Data</h2>
          <p className="text-slate-400 mt-2">
            Market data, regulatory filings, and litigation tracking
          </p>
        </div>
        <Button
          onClick={loadAllData}
          variant="outline"
          className="gap-2"
          disabled={isLoading}
        >
          <RefreshCw className="h-4 w-4" />
          Refresh Data
        </Button>
      </div>

      <div className="bg-amber-900/20 border border-amber-700 rounded-lg p-4">
        <p className="text-amber-200 text-sm font-medium mb-2">⚠ Collapsible Tertiary Data</p>
        <p className="text-amber-300 text-xs">
          This section displays supplementary financial context. Primary observability metrics
          are on the main dashboard. Data is sourced from Polygon.io (GOOGL stock), SEC EDGAR
          (regulatory filings), and CourtListener (litigation tracking).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StockTile stockData={stockData} isLoading={isLoading} />
        <LitigationCard litigationData={litigationData} isLoading={isLoading} />
      </div>

      <SECFilingTable filings={secFilings} searchTerm="artificial intelligence" />

      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Data Sources</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div>
            <p className="text-slate-400 mb-2 font-medium">Stock Data</p>
            <p className="text-white">Polygon.io API</p>
            <p className="text-slate-500 text-xs mt-1">
              Real-time OHLCV data for GOOGL. Requires API key configuration.
            </p>
          </div>
          <div>
            <p className="text-slate-400 mb-2 font-medium">Litigation Tracking</p>
            <p className="text-white">CourtListener REST API</p>
            <p className="text-slate-500 text-xs mt-1">
              Federal and state court docket searches. Returns count of matching entries.
            </p>
          </div>
          <div>
            <p className="text-slate-400 mb-2 font-medium">SEC Filings</p>
            <p className="text-white">SEC EDGAR RSS Feed</p>
            <p className="text-slate-500 text-xs mt-1">
              Alphabet Inc. (CIK: 0001652044) filings with regex-based mention extraction.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
