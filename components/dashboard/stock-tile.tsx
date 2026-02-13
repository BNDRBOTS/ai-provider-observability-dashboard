"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { StockData } from "@/lib/data-fetchers"
import { TrendingUp, TrendingDown, AlertCircle, DollarSign } from "lucide-react"

interface StockTileProps {
  stockData: StockData | null
  isLoading?: boolean
}

export function StockTile({ stockData, isLoading }: StockTileProps) {
  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-emerald-900 to-emerald-800 border-emerald-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            GOOGL Stock
          </CardTitle>
          <CardDescription className="text-emerald-200">Loading market data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-12 bg-emerald-700 rounded"></div>
            <div className="h-4 bg-emerald-700 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!stockData || stockData.source === 'unavailable' || stockData.price === null) {
    return (
      <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            {stockData?.symbol || 'GOOGL'} Stock
          </CardTitle>
          <CardDescription className="text-slate-400">
            Market data unavailable
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-6 w-6 text-amber-500 mt-1" />
              <div>
                <p className="text-slate-300 font-medium mb-2">No Public Market Price</p>
                <p className="text-slate-400 text-sm">
                  {stockData?.error || 'Private company - no public market price available'}
                </p>
                {stockData?.source === 'unavailable' && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p className="text-slate-500 text-xs mt-2 cursor-help underline decoration-dotted">
                          Configuration required
                        </p>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs max-w-xs">
                          Set NEXT_PUBLIC_POLYGON_API_KEY environment variable to fetch
                          real stock data from Polygon.io
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const isPositive = (stockData.change || 0) >= 0

  return (
    <Card className="bg-gradient-to-br from-emerald-900 to-emerald-800 border-emerald-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <span className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            {stockData.symbol}
          </span>
          <span className="text-xs font-normal text-emerald-300">
            {stockData.source.toUpperCase()}
          </span>
        </CardTitle>
        <CardDescription className="text-emerald-200">
          Alphabet Inc. (Google) - Public Market
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-emerald-800/50 p-4 rounded-lg border border-emerald-600">
          <p className="text-5xl font-bold text-white mb-2">
            ${stockData.price.toFixed(2)}
          </p>
          <div className="flex items-center gap-2">
            {isPositive ? (
              <TrendingUp className="h-5 w-5 text-green-400" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-400" />
            )}
            <span className={`text-lg font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {isPositive ? '+' : ''}{stockData.change?.toFixed(2)}
            </span>
            <span className={`text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
              ({isPositive ? '+' : ''}{stockData.changePercent?.toFixed(2)}%)
            </span>
          </div>
        </div>

        {stockData.volume && (
          <div className="bg-emerald-800/30 p-3 rounded-lg border border-emerald-600">
            <p className="text-emerald-300 text-xs mb-1">Volume</p>
            <p className="text-white font-semibold text-lg">
              {(stockData.volume / 1_000_000).toFixed(2)}M
            </p>
          </div>
        )}

        <p className="text-xs text-emerald-300">
          Updated: {new Date(stockData.timestamp).toLocaleString()}
        </p>
      </CardContent>
    </Card>
  )
}
