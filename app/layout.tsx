import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TooltipProvider } from '@/components/ui/tooltip'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Provider Observatory',
  description: 'Real-time monitoring and verification system for AI service providers with zero fabricated data',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-slate-950 text-white min-h-screen`}>
        <TooltipProvider>
          <div className="min-h-screen flex flex-col">
            <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
              <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                      AI Provider Observatory
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">
                      Zero fabrication · Cryptographic verification · Real-time monitoring
                    </p>
                  </div>
                </div>
                <nav className="mt-4">
                  <div className="flex gap-2">
                    <Link 
                      href="/" 
                      className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors text-slate-300 hover:text-white"
                    >
                      Dashboard
                    </Link>
                    <Link 
                      href="/usage" 
                      className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors text-slate-300 hover:text-white"
                    >
                      Usage Logs
                    </Link>
                    <Link 
                      href="/financial" 
                      className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors text-slate-300 hover:text-white"
                    >
                      Financial Data
                    </Link>
                    <Link 
                      href="/verification" 
                      className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors text-slate-300 hover:text-white"
                    >
                      Verification
                    </Link>
                  </div>
                </nav>
              </div>
            </header>
            <main className="flex-1 container mx-auto px-4 py-8">
              {children}
            </main>
            <footer className="border-t border-slate-800 bg-slate-900/50 py-6 mt-12">
              <div className="container mx-auto px-4 text-center text-slate-400 text-sm">
                <p>AI Provider Observatory · Built with Next.js 16 + React 19 + Tailwind CSS v4</p>
                <p className="mt-2 text-xs text-slate-500">
                  All data sourced from deterministic, machine-readable APIs · No LLM classification · No fabricated metrics
                </p>
              </div>
            </footer>
          </div>
        </TooltipProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined') {
                import('/lib/fetch-interceptor.ts').then(module => {
                  module.installFetchInterceptor();
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
