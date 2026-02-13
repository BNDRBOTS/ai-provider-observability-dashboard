"use client"

import { useEffect, useState } from 'react'
import { ProviderHealthCard } from '@/components/dashboard/provider-health-card'
import { CostPerRequestCard } from '@/components/dashboard/cost-per-request-card'
import { ModelRouterGauge } from '@/components/dashboard/model-router-gauge'
import { StockTile } from '@/components/dashboard/stock-tile'
import { getAllUsageRecords, UsageRecord } from '@/lib/indexeddb'
import { HealthCheck, StockData, fetchGoogleStock, performHealthCheck } from '@/lib/data-fetchers'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'

export default function DashboardPage() {
  const [usageRecords, setUsageRecords] = useState<UsageRecord[]>([])
  const [healthCheck, setHealthCheck] = useState<HealthCheck | null>(null)
  const [stockData, setStockData] = useState<StockData | null>(null)
  const [isLoadingHealth, setIsLoadingHealth] = useState(false)
  const [isLoadingStock, setIsLoadingStock] = useState(true)

  useEffect(() => {
    loadUsageRecords()
    loadStockData()
  }, [])

  const loadUsageRecords = async () => {
    const records = await getAllUsageRecords()
    setUsageRecords(records)
  }

  const loadStockData = async () => {
    setIsLoadingStock(true)
    const data = await fetchGoogleStock()
    setStockData(data)
    setIsLoadingStock(false)
  }

  const runHealthCheck = async () => {
    setIsLoadingHealth(true)
    const check = await performHealthCheck(
      'OpenAI',
      'https://api.openai.com/v1/models'
    )
    setHealthCheck(check)
    setIsLoadingHealth(false)
  }

  useEffect(() => {
    const interval = setInterval(() => {
      loadUsageRecords()
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Dashboard Overview</h2>
          <p className="text-slate-400 mt-2">
            Real-time monitoring of AI provider observability metrics
          </p>
        </div>
        <Button
          onClick={() => {
            loadUsageRecords()
            loadStockData()
          }}
          variant="outline"
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh Data
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ModelRouterGauge usageRecords={usageRecords} />
        <CostPerRequestCard usageRecords={usageRecords} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <ProviderHealthCard 
            healthCheck={healthCheck} 
            isLoading={isLoadingHealth}
          />
          {!healthCheck && (
            <Button
              onClick={runHealthCheck}
              className="mt-4 w-full"
              disabled={isLoadingHealth}
            >
              Run Health Check
            </Button>
          )}
        </div>
        <StockTile stockData={stockData} isLoading={isLoadingStock} />
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">System Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-slate-400 mb-1">Client-side Monitoring</p>
            <p className="text-white font-medium">Fetch Interceptor Active</p>
            <p className="text-slate-500 text-xs mt-1">
              Captures AI API calls via monkeypatched fetch/XHR
            </p>
          </div>
          <div>
            <p className="text-slate-400 mb-1">Storage Backend</p>
            <p className="text-white font-medium">IndexedDB (idb-keyval)</p>
            <p className="text-slate-500 text-xs mt-1">
              Client-side persistence for usage logs
            </p>
          </div>
          <div>
            <p className="text-slate-400 mb-1">Data Integrity</p>
            <p className="text-white font-medium">SHA-256 Hashing</p>
            <p className="text-slate-500 text-xs mt-1">
              Cryptographic verification of all fetched data
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
