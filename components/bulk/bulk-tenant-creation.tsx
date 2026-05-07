'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import {
  parseCSVTenants,
  validateTenantBulk,
  bulkCreateTenants,
} from '@/lib/actions/tenant'
import { type TenantBulkPreview, type TenantBulkResult } from '@/lib/actions/schema'
import { toast } from 'sonner'
import { Download, FileSpreadsheet } from 'lucide-react'
import { generateBulkLeasesZip } from '@/lib/pdf-generator'

interface BulkTenantCreationProps {
  propertyId: string
  onSuccess?: (result: TenantBulkResult) => void
}

// interface TableRow {
//   rowIndex: number
//   email: string
//   roomId: string
//   rent: number
//   deposit: number
// }

export function BulkTenantCreation({ propertyId, onSuccess }: BulkTenantCreationProps) {
  const [loading, setLoading] = useState(false)

  const [csvContent, setCSVContent] = useState('')
  const [csvPreview, setCSVPreview] = useState<TenantBulkPreview[]>([])



  const [result, setResult] = useState<TenantBulkResult | null>(null)

  const handleCSVPreview = async () => {
    if (!csvContent.trim()) {
      toast.error('Please paste CSV content')
      return
    }

    const preview = await parseCSVTenants(csvContent)
    const validated = await validateTenantBulk(propertyId, preview)
    setCSVPreview(validated)
  }

  const handleCSVSubmit = async () => {
    if (!csvPreview.length) {
      toast.error('Generate preview first')
      return
    }

    setLoading(true)
    try {
      const result = await bulkCreateTenants(propertyId, csvPreview)
      setResult(result)
      toast.success('Tenants created', {
        description: `${result.success} tenants added, ${result.failed} failed`,
      })

      if (onSuccess) {
        onSuccess(result)
      }
    } catch (error) {
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'Failed to create tenants',
      })
    } finally {
      setLoading(false)
    }
  }


  if (result) {
    return (
      <Card className="p-6 space-y-4 border-emerald-200 bg-emerald-50 dark:bg-emerald-950">
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-100">
            Tenants Added Successfully
          </h3>
          <p className="text-sm text-emerald-700 dark:text-emerald-300">
            {result.success} tenants added
          </p>
        </div>

        <div className="flex justify-center mt-4">
          <Button
            variant="default"
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full"
            onClick={() => {
              const leasesToGenerate = result.details.created.map(c => ({
                email: c.email,
                roomNumber: c.roomNumber || 'N/A',
                rentAmount: c.rentAmount || 0,
                deposit: c.deposit || 0,
                propertyName: c.propertyName || 'Property',
              }))
              generateBulkLeasesZip(leasesToGenerate)
            }}
          >
            <Download className="mr-2 h-4 w-4" />
            Download Generated Leases (ZIP)
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 bg-white dark:bg-black rounded border border-emerald-200">
            <p className="text-xs text-gray-600 dark:text-gray-400">Total</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{result.total}</p>
          </div>
          <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded border border-emerald-300">
            <p className="text-xs text-emerald-700 dark:text-emerald-300">Success</p>
            <p className="text-lg font-bold text-emerald-900 dark:text-emerald-100">{result.success}</p>
          </div>
          <div className="p-2 bg-red-100 dark:bg-red-900 rounded border border-red-300">
            <p className="text-xs text-red-700 dark:text-red-300">Failed</p>
            <p className="text-lg font-bold text-red-900 dark:text-red-100">{result.failed}</p>
          </div>
        </div>

        {result.details.errors.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-red-900 dark:text-red-100">Failed Rows:</h4>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {result.details.errors.map((error, i) => (
                <div key={i} className="text-xs p-2 bg-white dark:bg-black rounded border border-red-200">
                  <p className="font-semibold text-red-700 dark:text-red-300">{error.name}</p>
                  <p className="text-gray-600 dark:text-gray-400">{error.error}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <Button
          onClick={() => {
            setResult(null)
            setCSVPreview([])
          }}
          className="w-full"
        >
          Add More Tenants
        </Button>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
        <div className="space-y-3">
          <div className="bg-emerald-50 dark:bg-emerald-950/30 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800/50 mb-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-emerald-900 dark:text-emerald-100 flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                CSV Format Instructions
              </h4>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 text-xs bg-white dark:bg-gray-950 border-emerald-200 hover:bg-emerald-100 hover:text-emerald-700"
                onClick={() => {
                  const csvContent = "email,roomId,rent,deposit\nexample@domain.com,cm0mxxxx0000xxxx,10000,50000"
                  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
                  const link = document.createElement('a')
                  link.href = URL.createObjectURL(blob)
                  link.download = 'tenant_bulk_upload_template.csv'
                  link.click()
                }}
              >
                <Download className="h-3 w-3 mr-1.5" />
                Download Template
              </Button>
            </div>
            <p className="text-xs text-emerald-700 dark:text-emerald-400 mb-2">
              Your CSV must include the following columns exactly as named:
            </p>
            <ul className="text-[11px] space-y-1 text-emerald-700/80 dark:text-emerald-400/80 list-disc list-inside ml-1">
              <li><strong>email</strong>: The tenant&apos;s email address (must be valid)</li>
              <li><strong>roomId</strong>: The system ID of the room (you can copy this from the room URL)</li>
              <li><strong>rent</strong>: Monthly rent amount (numbers only)</li>
              <li><strong>deposit</strong>: Security deposit amount (numbers only)</li>
            </ul>
          </div>

          <textarea
            value={csvContent}
            onChange={(e) => setCSVContent(e.target.value)}
            placeholder="Paste your CSV data here..."
            className="w-full h-32 p-3 border border-gray-200 dark:border-gray-800 rounded-xl font-mono text-[13px] resize-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all dark:bg-gray-950"
          />

          <Button onClick={handleCSVPreview} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-full">
            Preview CSV
          </Button>
        </div>

        {csvPreview.length > 0 && (
          <Card className="p-3 border-gray-200 space-y-2">
            <p className="text-xs font-semibold">
              Preview: {csvPreview.length} tenants
            </p>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {csvPreview.map((tenant, i) => (
                <div
                  key={i}
                  className={`p-2 text-xs rounded border ${
                    tenant.isValid
                      ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-200'
                      : 'bg-red-50 dark:bg-red-950 border-red-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-semibold">{tenant.email}</p>
                      <p className="text-gray-600 dark:text-gray-400">
                        Room: {tenant.roomId} | Rent: {tenant.rent}
                      </p>
                    </div>
                    {tenant.isValid ? (
                      <span className="text-emerald-600 dark:text-emerald-400 text-lg">✓</span>
                    ) : (
                      <span className="text-red-600 dark:text-red-400 text-lg">✗</span>
                    )}
                  </div>
                  {tenant.error && (
                    <p className="text-red-600 dark:text-red-400 mt-1">{tenant.error}</p>
                  )}
                  {tenant.warnings && (
                    <div className="text-yellow-600 dark:text-yellow-400 mt-1">
                      {tenant.warnings.map((w, i) => (
                        <p key={i}>⚠ {w}</p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <Button
              onClick={handleCSVSubmit}
              disabled={loading || csvPreview.some((p) => !p.isValid)}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
            >
              {loading && <Spinner className="w-4 h-4 mr-2" />}
              Add Tenants
            </Button>
          </Card>
        )}
    </div>
  )
}
