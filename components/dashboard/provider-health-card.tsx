"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { HealthCheck } from "@/lib/data-fetchers"
import { CheckCircle2, AlertCircle, XCircle, Clock } from "lucide-react"

interface ProviderHealthCardProps {
  healthCheck: HealthCheck | null
  isLoading?: boolean
}

export function ProviderHealthCard({ healthCheck, isLoading }: ProviderHealthCardProps) {
  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Provider Health</CardTitle>
          <CardDescription className="text-slate-400">Loading health status...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-8 bg-slate-700 rounded"></div>
            <div className="h-4 bg-slate-700 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!healthCheck) {
    return (
      <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Provider Health</CardTitle>
          <CardDescription className="text-slate-400">
            No health check data available
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
            <AlertCircle className="h-8 w-8 text-amber-500" />
            <div>
              <p className="text-sm text-slate-300 font-medium">No Data</p>
              <p className="text-xs text-slate-500">
                Health checks require API configuration or manual execution
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const statusConfig = {
    operational: {
      icon: CheckCircle2,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/30",
      label: "Operational",
      badgeVariant: "default" as const
    },
    degraded: {
      icon: AlertCircle,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/30",
      label: "Degraded",
      badgeVariant: "secondary" as const
    },
    unreachable: {
      icon: XCircle,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/30",
      label: "Unreachable",
      badgeVariant: "destructive" as const
    }
  }

  const config = statusConfig[healthCheck.status]
  const StatusIcon = config.icon

  return (
    <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <span>{healthCheck.provider}</span>
          <Badge variant={config.badgeVariant}>{config.label}</Badge>
        </CardTitle>
        <CardDescription className="text-slate-400">
          Synthetic health check
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className={`flex items-center gap-4 p-4 rounded-lg border ${config.bgColor} ${config.borderColor}`}>
          <StatusIcon className={`h-10 w-10 ${config.color}`} />
          <div className="flex-1">
            <p className={`text-lg font-semibold ${config.color}`}>
              {config.label}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {new Date(healthCheck.timestamp).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <Clock className="h-3 w-3" />
              Response Time
            </div>
            <p className="text-xl font-bold text-white">
              {healthCheck.responseTime}ms
            </p>
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700 cursor-help">
                  <div className="text-slate-400 text-xs mb-1">Endpoint</div>
                  <p className="text-sm font-mono text-white truncate">
                    {new URL(healthCheck.endpoint).pathname}
                  </p>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs font-mono">{healthCheck.endpoint}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {healthCheck.error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
            <p className="text-xs text-red-400 font-mono">{healthCheck.error}</p>
          </div>
        )}

        <p className="text-xs text-slate-500 italic">
          ⚠ Never rely on provider status page HTML - this is a direct API check
        </p>
      </CardContent>
    </Card>
  )
}
