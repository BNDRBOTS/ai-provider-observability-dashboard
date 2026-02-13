"use client"

import { ReactNode } from "react"
import { AlertCircle } from "lucide-react"

interface NullStateBoundaryProps {
  condition: boolean
  message: string
  reason: string
  children: ReactNode
}

export function NullStateBoundary({ condition, message, reason, children }: NullStateBoundaryProps) {
  if (!condition) {
    return (
      <div className="bg-slate-900 border border-slate-700 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <AlertCircle className="h-8 w-8 text-amber-500 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-white font-semibold mb-2">{message}</h3>
            <p className="text-slate-400 text-sm">{reason}</p>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
