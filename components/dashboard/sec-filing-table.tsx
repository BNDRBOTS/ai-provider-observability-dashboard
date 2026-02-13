"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SECFiling } from "@/lib/data-fetchers"
import { FileText, ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface SECFilingTableProps {
  filings: SECFiling[]
  searchTerm?: string
}

export function SECFilingTable({ filings, searchTerm }: SECFilingTableProps) {
  if (filings.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-indigo-900 to-indigo-800 border-indigo-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <FileText className="h-5 w-5" />
            SEC EDGAR Filings
          </CardTitle>
          <CardDescription className="text-indigo-200">
            Recent regulatory filings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-indigo-800/50 border border-indigo-600 rounded-lg p-4">
            <p className="text-indigo-200 font-medium mb-2">No Filings Found</p>
            <p className="text-indigo-300 text-sm">
              No recent SEC filings available or search term "{searchTerm}" not found in
              recent Alphabet Inc. (CIK: 0001652044) filings. Data fetched from SEC EDGAR
              RSS-to-JSON feed.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-br from-indigo-900 to-indigo-800 border-indigo-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <FileText className="h-5 w-5" />
          SEC EDGAR Filings
        </CardTitle>
        <CardDescription className="text-indigo-200">
          {filings.length} filings {searchTerm && `mentioning "${searchTerm}"`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {filings.map((filing, index) => (
            <div
              key={index}
              className="bg-indigo-800/50 border border-indigo-600 rounded-lg p-4 hover:bg-indigo-800/70 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant="outline" className="bg-indigo-700 text-indigo-100 border-indigo-500">
                      {filing.formType}
                    </Badge>
                    {filing.mentions > 0 && (
                      <Badge className="bg-amber-600 text-white">
                        {filing.mentions} mentions
                      </Badge>
                    )}
                  </div>
                  <p className="text-white font-medium mb-1">{filing.company}</p>
                  <p className="text-indigo-300 text-sm mb-2">
                    Filed: {new Date(filing.filingDate).toLocaleDateString()}
                  </p>
                  <p className="text-indigo-400 text-xs font-mono">CIK: {filing.cik}</p>
                </div>
                <a
                  href={filing.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-indigo-300 hover:text-white transition-colors text-sm"
                >
                  <ExternalLink className="h-4 w-4" />
                  View
                </a>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-indigo-300 mt-4 italic">
          Data extracted via regex from SEC EDGAR RSS feed - no LLM classification
        </p>
      </CardContent>
    </Card>
  )
}
