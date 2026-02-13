"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Shield, Copy, Check } from "lucide-react"

interface DataHash {
  name: string
  hash: string
  timestamp: number
  size: number
}

interface HashManifestViewerProps {
  hashes: DataHash[]
}

export function HashManifestViewer({ hashes }: HashManifestViewerProps) {
  const [copiedHash, setCopiedHash] = useState<string | null>(null)

  const copyToClipboard = async (hash: string, name: string) => {
    await navigator.clipboard.writeText(hash)
    setCopiedHash(name)
    setTimeout(() => setCopiedHash(null), 2000)
  }

  if (hashes.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-cyan-900 to-cyan-800 border-cyan-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Data Integrity Verification
          </CardTitle>
          <CardDescription className="text-cyan-200">
            SHA-256 hash manifest
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-cyan-800/50 border border-cyan-600 rounded-lg p-4">
            <p className="text-cyan-200 font-medium mb-2">No Hash Manifest Available</p>
            <p className="text-cyan-300 text-sm">
              Hash manifest generation occurs during Netlify scheduled function execution.
              All fetched JSON payloads are hashed using SHA-256 and stored for verification.
              Check back after the next scheduled data fetch (runs twice daily at 00:00 and 12:00 UTC).
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-br from-cyan-900 to-cyan-800 border-cyan-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Data Integrity Verification
        </CardTitle>
        <CardDescription className="text-cyan-200">
          {hashes.length} verified data sources
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-cyan-800/50 border border-cyan-600 rounded-lg p-4">
            <p className="text-cyan-200 text-sm mb-3">
              Every external API response is hashed using SHA-256 (Node.js crypto module)
              to enable verification that no data has been fabricated or altered.
            </p>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-cyan-700 text-cyan-100 border-cyan-500">
                Zero Fabrication Protocol
              </Badge>
              <Badge variant="outline" className="bg-cyan-700 text-cyan-100 border-cyan-500">
                Cryptographic Verification
              </Badge>
            </div>
          </div>

          <Separator className="bg-cyan-700" />

          <div className="space-y-3">
            {hashes.map((item, index) => (
              <div
                key={index}
                className="bg-cyan-800/30 border border-cyan-600 rounded-lg p-4"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <p className="text-white font-semibold mb-1">{item.name}</p>
                    <p className="text-cyan-300 text-xs">
                      {new Date(item.timestamp).toLocaleString()}
                    </p>
                    <p className="text-cyan-400 text-xs mt-1">
                      Size: {(item.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(item.hash, item.name)}
                    className="bg-cyan-700 hover:bg-cyan-600 text-white border-cyan-500"
                  >
                    {copiedHash === item.name ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <div className="bg-cyan-900 rounded p-2">
                  <p className="text-cyan-200 font-mono text-xs break-all">
                    {item.hash}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-cyan-800/50 border border-cyan-600 rounded-lg p-3 mt-4">
            <p className="text-cyan-200 text-xs font-semibold mb-2">Verification Instructions:</p>
            <ol className="text-cyan-300 text-xs space-y-1 list-decimal list-inside">
              <li>Copy hash from manifest above</li>
              <li>Download raw JSON from /public/data directory</li>
              <li>Run: echo -n "$(cat file.json)" | sha256sum</li>
              <li>Compare output to manifest hash</li>
            </ol>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
