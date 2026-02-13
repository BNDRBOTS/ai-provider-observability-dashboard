"use client"

import { useState, useEffect } from 'react'
import { HashManifestViewer } from '@/components/dashboard/hash-manifest-viewer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Shield, CheckCircle2, AlertCircle } from 'lucide-react'

interface DataHash {
  name: string
  hash: string
  timestamp: number
  size: number
}

export default function VerificationPage() {
  const [hashes, setHashes] = useState<DataHash[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadHashManifest()
  }, [])

  const loadHashManifest = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/data/hash-manifest.json')
      if (response.ok) {
        const data = await response.json()
        setHashes(data.hashes || [])
      }
    } catch (error) {
      console.error('Failed to load hash manifest:', error)
    }
    setIsLoading(false)
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold">Data Integrity Verification</h2>
        <p className="text-slate-400 mt-2">
          Cryptographic verification of all external data sources
        </p>
      </div>

      <Card className="bg-gradient-to-br from-green-900 to-green-800 border-green-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Zero Fabrication Protocol
          </CardTitle>
          <CardDescription className="text-green-200">
            Architectural guarantees against data fabrication
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-800/50 border border-green-600 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-green-400 mt-1" />
                <div>
                  <p className="text-white font-semibold mb-1">No LLM Classification</p>
                  <p className="text-green-200 text-sm">
                    No GPT, Claude, or other LLM used in data pipeline. All analysis is
                    deterministic regex/JSON parsing.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green-800/50 border border-green-600 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-green-400 mt-1" />
                <div>
                  <p className="text-white font-semibold mb-1">SHA-256 Hashing</p>
                  <p className="text-green-200 text-sm">
                    Every fetched JSON payload is hashed using Node.js crypto module.
                    Manifest stored for verification.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green-800/50 border border-green-600 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-green-400 mt-1" />
                <div>
                  <p className="text-white font-semibold mb-1">Machine-Readable Sources</p>
                  <p className="text-green-200 text-sm">
                    Polygon.io, CourtListener, SEC EDGAR - all structured API responses.
                    No HTML scraping or sentiment analysis.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green-800/50 border border-green-600 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-green-400 mt-1" />
                <div>
                  <p className="text-white font-semibold mb-1">Null State Boundaries</p>
                  <p className="text-green-200 text-sm">
                    Every chart and tile renders explicit absence state explaining exactly
                    why data is missing. No placeholder data.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <HashManifestViewer hashes={hashes} />

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle>Verification Steps</CardTitle>
          <CardDescription>How to verify data integrity manually</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Badge variant="outline">Step 1</Badge>
                Locate Source Data
              </h4>
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                <p className="text-slate-300 text-sm mb-2">
                  All fetched data is stored in <code className="bg-slate-700 px-2 py-1 rounded text-xs">/public/data/</code>
                </p>
                <ul className="text-slate-400 text-sm space-y-1 list-disc list-inside">
                  <li>stock-data.json - Polygon.io GOOGL OHLCV</li>
                  <li>litigation-data.json - CourtListener case counts</li>
                  <li>sec-filings.json - SEC EDGAR RSS feed</li>
                  <li>health-checks.json - Synthetic provider checks</li>
                </ul>
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Badge variant="outline">Step 2</Badge>
                Calculate Hash
              </h4>
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                <p className="text-slate-300 text-sm mb-3">Use SHA-256 to hash the JSON file:</p>
                <pre className="bg-slate-900 border border-slate-700 rounded p-3 text-xs text-slate-300 overflow-x-auto">
{`# Linux/Mac
echo -n "$(cat stock-data.json)" | sha256sum

# Windows (PowerShell)
Get-FileHash -Algorithm SHA256 stock-data.json`}
                </pre>
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Badge variant="outline">Step 3</Badge>
                Compare to Manifest
              </h4>
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                <p className="text-slate-300 text-sm">
                  Match the calculated hash against the value in the Hash Manifest Viewer above.
                  If hashes match, data integrity is confirmed. If they don't match, data has
                  been altered since generation.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-6 w-6 text-red-400 mt-1" />
          <div>
            <p className="text-red-200 font-semibold mb-2">Verification Failures</p>
            <p className="text-red-300 text-sm">
              If hash verification fails, possible causes: (1) Data file modified after generation,
              (2) Manifest out of sync with data files, (3) Scheduled function failed to execute.
              Check Netlify function logs for execution history.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
