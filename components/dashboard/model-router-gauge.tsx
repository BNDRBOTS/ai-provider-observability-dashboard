"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UsageRecord } from "@/lib/indexeddb"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { Activity } from "lucide-react"

interface ModelRouterGaugeProps {
  usageRecords: UsageRecord[]
}

const PROVIDER_COLORS: Record<string, string> = {
  'OpenAI': '#10B981',
  'Anthropic': '#F59E0B',
  'Google': '#3B82F6',
  'DeepSeek': '#8B5CF6',
  'xAI (Grok)': '#EC4899',
}

export function ModelRouterGauge({ usageRecords }: ModelRouterGaugeProps) {
  if (usageRecords.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-blue-900 to-blue-800 border-blue-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Model Router Distribution
          </CardTitle>
          <CardDescription className="text-blue-200">
            Request distribution by provider
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-800/50 border border-blue-600 rounded-lg p-6 text-center">
            <Activity className="h-12 w-12 text-blue-400 mx-auto mb-3" />
            <p className="text-blue-200 font-medium mb-2">No Routing Data</p>
            <p className="text-blue-300 text-sm">
              No AI provider requests detected. The client-side fetch interceptor
              captures API calls to OpenAI, Anthropic, Google, DeepSeek, and xAI.
              Make requests to see distribution patterns.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const providerCounts = usageRecords.reduce((acc, record) => {
    acc[record.provider] = (acc[record.provider] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const chartData = Object.entries(providerCounts).map(([provider, count]) => ({
    name: provider,
    value: count,
    percentage: ((count / usageRecords.length) * 100).toFixed(1)
  }))

  return (
    <Card className="bg-gradient-to-br from-blue-900 to-blue-800 border-blue-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Model Router Distribution
        </CardTitle>
        <CardDescription className="text-blue-200">
          {usageRecords.length} total requests tracked
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percentage }) => `${name} ${percentage}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={PROVIDER_COLORS[entry.name] || '#6B7280'} 
                />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1e293b', 
                border: '1px solid #475569',
                borderRadius: '8px',
                color: '#fff'
              }}
            />
            <Legend 
              wrapperStyle={{ color: '#fff' }}
              formatter={(value) => <span className="text-white">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="mt-4 space-y-2">
          {chartData.map((item) => (
            <div 
              key={item.name}
              className="flex items-center justify-between bg-blue-800/30 p-3 rounded-lg border border-blue-600"
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: PROVIDER_COLORS[item.name] || '#6B7280' }}
                />
                <span className="text-white font-medium">{item.name}</span>
              </div>
              <div className="text-right">
                <p className="text-white font-bold">{item.value}</p>
                <p className="text-blue-300 text-xs">{item.percentage}%</p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-blue-300 mt-4 italic">
          Updates in real-time from IndexedDB as requests are captured
        </p>
      </CardContent>
    </Card>
  )
}
