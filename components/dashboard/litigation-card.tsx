"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LitigationData } from "@/lib/data-fetchers"
import { Scale, ExternalLink, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface LitigationCardProps {
  litigationData: LitigationData | null
  isLoading?: boolean
}

export function LitigationCard({ litigationData, isLoading }: LitigationCardProps) {
  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-rose-900 to-rose-800 border-rose-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Litigation Tracking
          </CardTitle>
          <CardDescription className="text-rose-200">Loading court data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-8 bg-rose-700 rounded"></div>
            <div className="h-16 bg-rose-700 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!litigationData || litigationData.count === 0) {
    return (
      <Card className="bg-gradient-to-br from-rose-900 to-rose-800 border-rose-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Litigation Tracking
          </CardTitle>
          <CardDescription className="text-rose-200">
            {litigationData ? `Query: "${litigationData.query}"` : 'Court docket search'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-rose-800/50 border border-rose-600 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-6 w-6 text-rose-400 mt-1" />
              <div>
                <p className="text-rose-200 font-medium mb-2">No Cases Found</p>
                <p className="text-rose-300 text-sm">
                  No court dockets found matching the search criteria via CourtListener API.
                  This searches federal and state court records for mentions of AI provider
                  companies.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-br from-rose-900 to-rose-800 border-rose-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Litigation Tracking
          </span>
          <Badge className="bg-rose-600 text-white">
            {litigationData.count} cases
          </Badge>
        </CardTitle>
        <CardDescription className="text-rose-200">
          Query: "{litigationData.query}" via {litigationData.source}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-rose-800/50 border border-rose-600 rounded-lg p-4 mb-4">
          <p className="text-3xl font-bold text-white mb-1">
            {litigationData.count.toLocaleString()}
          </p>
          <p className="text-rose-200 text-sm">Total Docket Entries Found</p>
          <p className="text-rose-300 text-xs mt-2">As of {litigationData.date}</p>
        </div>

        {litigationData.cases.length > 0 && (
          <div className="space-y-3">
            <p className="text-rose-200 font-medium text-sm mb-2">Recent Cases:</p>
            {litigationData.cases.slice(0, 5).map((caseItem, index) => (
              <div
                key={index}
                className="bg-rose-800/30 border border-rose-600 rounded-lg p-3 hover:bg-rose-800/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-white font-medium text-sm mb-1">
                      {caseItem.caseName}
                    </p>
                    <p className="text-rose-300 text-xs mb-1">
                      Docket: {caseItem.docketNumber} | {caseItem.court}
                    </p>
                    <p className="text-rose-400 text-xs">
                      Filed: {new Date(caseItem.dateFiled).toLocaleDateString()}
                    </p>
                  </div>
                  {caseItem.url && (
                    <a
                      href={caseItem.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-rose-300 hover:text-white transition-colors text-xs"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-rose-300 mt-4 italic">
          Data from CourtListener REST API - count reflects docket entries containing search term
        </p>
      </CardContent>
    </Card>
  )
}
