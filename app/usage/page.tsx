"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getAllUsageRecords, clearUsageRecords, UsageRecord } from '@/lib/indexeddb'
import { Badge } from '@/components/ui/badge'
import { Trash2, RefreshCw, Database } from 'lucide-react'
import { format } from 'date-fns'

export default function UsagePage() {
  const [records, setRecords] = useState<UsageRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadRecords = async () => {
    setIsLoading(true)
    const data = await getAllUsageRecords()
    setRecords(data)
    setIsLoading(false)
  }

  const handleClearRecords = async () => {
    if (confirm('Are you sure you want to clear all usage records? This cannot be undone.')) {
      await clearUsageRecords()
      setRecords([])
    }
  }

  useEffect(() => {
    loadRecords()
  }, [])

  const totalTokens = records.reduce((sum, r) => sum + r.totalTokens, 0)
  const totalRequests = records.length
  const avgResponseTime = records.length > 0
    ? records.reduce((sum, r) => sum + r.responseTime, 0) / records.length
    : 0

  const providerBreakdown = records.reduce((acc, record) => {
    acc[record.provider] = (acc[record.provider] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Usage Logs</h2>
          <p className="text-slate-400 mt-2">
            Detailed client-side AI API request tracking
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={loadRecords}
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button
            onClick={handleClearRecords}
            variant="destructive"
            className="gap-2"
            disabled={records.length === 0}
          >
            <Trash2 className="h-4 w-4" />
            Clear All
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-900 to-blue-800 border-blue-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-200">Total Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">{totalRequests}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-900 to-purple-800 border-purple-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-purple-200">Total Tokens</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">{totalTokens.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-900 to-emerald-800 border-emerald-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-emerald-200">Avg Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">{Math.round(avgResponseTime)}ms</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-900 to-amber-800 border-amber-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-amber-200">Providers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">{Object.keys(providerBreakdown).length}</p>
          </CardContent>
        </Card>
      </div>

      {records.length === 0 ? (
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Database className="h-16 w-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 font-medium mb-2">No Usage Records</p>
              <p className="text-slate-500 text-sm max-w-md mx-auto">
                The fetch interceptor monitors AI API calls and logs usage data to IndexedDB.
                Records appear here automatically as you make requests to supported providers
                (OpenAI, Anthropic, Google, DeepSeek, xAI).
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle>Request History</CardTitle>
            <CardDescription>Showing {records.length} logged requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {records.map((record) => (
                <div
                  key={record.id}
                  className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:bg-slate-800/70 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="bg-blue-900 text-blue-100 border-blue-700">
                        {record.provider}
                      </Badge>
                      <span className="text-white font-medium">{record.model}</span>
                    </div>
                    <span className="text-slate-400 text-sm">
                      {format(new Date(record.timestamp), 'MMM d, h:mm:ss a')}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                    <div>
                      <p className="text-slate-500 text-xs mb-1">Request Tokens</p>
                      <p className="text-white font-semibold">{record.requestTokens}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs mb-1">Response Tokens</p>
                      <p className="text-white font-semibold">{record.responseTokens}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs mb-1">Total Tokens</p>
                      <p className="text-white font-semibold">{record.totalTokens}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs mb-1">Response Time</p>
                      <p className="text-white font-semibold">{record.responseTime}ms</p>
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <p className="text-slate-500 text-xs mb-1">Endpoint</p>
                      <p className="text-white font-mono text-xs truncate" title={record.endpoint}>
                        {new URL(record.endpoint).pathname}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle>Provider Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(providerBreakdown).map(([provider, count]) => (
              <div key={provider} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                <p className="text-slate-400 text-sm mb-2">{provider}</p>
                <p className="text-2xl font-bold text-white">{count}</p>
                <p className="text-slate-500 text-xs mt-1">
                  {((count / totalRequests) * 100).toFixed(1)}% of total
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
