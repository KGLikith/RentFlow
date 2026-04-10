'use client'

import { ReactNode } from 'react'

export function ClerkProviderWrapper({ children }: { children: ReactNode }) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

  if (!publishableKey) {
    return (
      <div className="min-h-screen bg-linear-to-br from-yellow-50 to-orange-100 flex flex-col items-center justify-center px-4">
        <div className="max-w-2xl w-full bg-white rounded-lg shadow-xl p-8 space-y-6">
          <div className="space-y-3">
            <h1 className="text-4xl font-bold text-gray-900">Setup Required</h1>
            <p className="text-lg text-gray-600">Clerk Authentication Configuration</p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-2">
            <p className="text-yellow-800 font-semibold">⚠️ Environment Variables Missing</p>
            <p className="text-yellow-700 text-sm">
              The application requires Clerk authentication environment variables to run.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Quick Setup:</h3>
              <ol className="space-y-3 text-gray-700">
                <li className="flex gap-3">
                  <span className="font-bold text-indigo-600 min-w-8">1.</span>
                  <span>Go to <a href="https://dashboard.clerk.com" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline font-semibold">https://dashboard.clerk.com</a></span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-indigo-600 min-w-8">2.</span>
                  <span>Click <span className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">API Keys</span></span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-indigo-600 min-w-8">3.</span>
                  <span>Copy your <span className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">Publishable Key</span> and <span className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">Secret Key</span></span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-indigo-600 min-w-8">4.</span>
                  <span>In v0, click the Settings button (⚙️ top right)</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-indigo-600 min-w-8">5.</span>
                  <span>Go to <span className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">Vars</span> tab</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-indigo-600 min-w-8">6.</span>
                  <span>Add these variables:
                    <div className="mt-2 space-y-2 ml-4">
                      <div className="bg-gray-50 p-3 rounded text-sm font-mono">
                        <div className="font-semibold text-gray-900">NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</div>
                        <div className="text-gray-600 text-xs mt-1">(paste your Publishable Key)</div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded text-sm font-mono">
                        <div className="font-semibold text-gray-900">CLERK_SECRET_KEY</div>
                        <div className="text-gray-600 text-xs mt-1">(paste your Secret Key)</div>
                      </div>
                    </div>
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-indigo-600 min-w-8">7.</span>
                  <span>Refresh the page</span>
                </li>
              </ol>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
              <p className="text-blue-800 font-semibold">Pro Tip</p>
              <p className="text-blue-700 text-sm">
                You&apos;ll also need to set your Clerk Redirect URLs in the dashboard to include your current domain (e.g., <span className="bg-white px-2 py-1 rounded text-xs font-mono">localhost:3000</span> for development)
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              Once you&apos;ve added the environment variables, refresh this page
            </p>
          </div>
        </div>
      </div>
    )
  }

  return children
}
