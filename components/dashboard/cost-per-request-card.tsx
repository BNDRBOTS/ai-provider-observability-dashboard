"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UsageRecord } from "@/lib/indexeddb"
import { DollarSign, TrendingUp } from "lucide-react"

interface CostPerRequestCardProps {
  usageRecords: UsageRecord[]
}

export function CostPerRequestCard({ usageRecords }: CostPerRequestCardProps) {
  const [costPerMTok, setCostPerMTok] = useState<number>(0.01)

  useEffect(() => {
    const stored = localStorage.getItem('costPerMTok')
    if (stored) {
      setCostPerMTok(parseFloat(stored))
    }
  }, [])

  const handleCostChange = (value: string) => {
    const numValue = parseFloat(value)
    if (!isNaN(numValue) && numValue >= 0) {
      setCostPerMTok(numValue)
      localStorage.setItem('costPerMTok', value)
    }
  }

  const totalTokens = usageRecords.reduce((sum, record) => sum + record.totalTokens, 0)
  const estimatedCost = (totalTokens / 1_000_000) * costPerMTok
  const avgTokensPerRequest = usageRecords.length > 0 ? totalTokens / usageRecords.length : 0
  const avgCostPerRequest = usageRecords.length > 0 ? estimatedCost / usageRecords.length : 0

  if (usageRecords.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-purple-900 to-purple-800 border-purple-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Cost Per Request
          </CardTitle>
          <CardDescription className="text-purple-200">
            Token usage cost estimation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-purple-800/50 border border-purple-600 rounded-lg p-4">
            <p className="text-purple-200 text-sm font-medium mb-2">No Usage Data</p>
            <p className="text-purple-300 text-xs">
              No AI API requests recorded today. The fetch interceptor monitors AI provider
              calls and extracts token counts from response bodies. Start making requests
              to see cost estimates here.
            </p>
          </div>

          <div className="mt-4">
            <Label htmlFor="costConfig" className="text-purple-200 text-sm">
              Configure Cost ($/Million Tokens)
            </Label>
            <Input
              id="costConfig"
              type="number"
              step="0.001"
              min="0"
              value={costPerMTok}
              onChange={(e) => handleCostChange(e.target.value)}
              className="mt-2 bg-purple-800/30 border-purple-600 text-white"
            />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-br from-purple-900 to-purple-800 border-purple-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Cost Per Request
        </CardTitle>
        <CardDescription className="text-purple-200">
          Based on {usageRecords.length} logged requests
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-purple-800/50 p-4 rounded-lg border border-purple-600">
            <div className="flex items-center gap-2 text-purple-200 text-xs mb-2">
              <TrendingUp className="h-4 w-4" />
              Total Cost (Est.)
            </div>
            <p className="text-3xl font-bold text-white">
              ${estimatedCost.toFixed(4)}
            </p>
          </div>

          <div className="bg-purple-800/50 p-4 rounded-lg border border-purple-600">
            <div className="text-purple-200 text-xs mb-2">Avg per Request</div>
            <p className="text-3xl font-bold text-white">
              ${avgCostPerRequest.toFixed(6)}
            </p>
          </div>
        </div>

        <div className="bg-purple-800/30 p-4 rounded-lg border border-purple-600">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-purple-300 mb-1">Total Tokens</p>
              <p className="text-white font-mono font-semibold">
                {totalTokens.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-purple-300 mb-1">Avg Tokens/Request</p>
              <p className="text-white font-mono font-semibold">
                {Math.round(avgTokensPerRequest).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="costInput" className="text-purple-200 text-sm">
            Cost Configuration ($/MTok)
          </Label>
          <Input
            id="costInput"
            type="number"
            step="0.001"
            min="0"
            value={costPerMTok}
            onChange={(e) => handleCostChange(e.target.value)}
            className="mt-2 bg-purple-800/30 border-purple-600 text-white"
          />
          <p className="text-xs text-purple-300 mt-2">
            Stored in localStorage. Adjust based on your provider pricing.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
