'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import {
  parseCSVTenants,
  validateTenantBulk,
  bulkCreateTenants,
  type TenantBulkPreview,
  type TenantBulkResult,
} from '@/lib/actions/tenant'
import { toast } from 'sonner'

interface BulkTenantCreationProps {
  propertyId: string
  onSuccess?: (result: TenantBulkResult) => void
}

interface TableRow {
  rowIndex: number
  name: string
  phone?: string
  email?: string
  roomId: string
  rent: number
  deposit: number
}

export function BulkTenantCreation({ propertyId, onSuccess }: BulkTenantCreationProps) {
  const [activeTab, setActiveTab] = useState('csv')
  const [loading, setLoading] = useState(false)

  const [csvContent, setCSVContent] = useState('')
  const [csvPreview, setCSVPreview] = useState<TenantBulkPreview[]>([])

  const [tableRows, setTableRows] = useState<TableRow[]>([
    {
      rowIndex: 1,
      name: '',
      phone: '',
      email: '',
      roomId: '',
      rent: 0,
      deposit: 0,
    },
  ])
  const [tablePreview, setTablePreview] = useState<TenantBulkPreview[]>([])

  const [result, setResult] = useState<TenantBulkResult | null>(null)

  const handleCSVPreview = async () => {
    if (!csvContent.trim()) {
      toast.error('Please paste CSV content')
      return
    }

    const preview = parseCSVTenants(csvContent)
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

  // Table preview
  const handleTablePreview = async () => {
    const preview = tableRows.map((row, i) => ({
      rowIndex: i + 1,
      name: row.name,
      phone: row.phone,
      email: row.email,
      roomId: row.roomId,
      rent: row.rent,
      deposit: row.deposit,
      isValid: !!row.name && !!row.roomId && row.rent >= 0 && row.deposit >= 0,
      error: !row.name
        ? 'Name required'
        : !row.roomId
          ? 'Room required'
          : undefined,
    }))

    const validated = await validateTenantBulk(propertyId, preview)
    setTablePreview(validated)
  }

  const handleTableSubmit = async () => {
    if (!tablePreview.length) {
      toast.error('Generate preview first')
      return
    }

    setLoading(true)
    try {
      const result = await bulkCreateTenants(propertyId, tablePreview)
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
            setTablePreview([])
          }}
          className="w-full"
        >
          Add More Tenants
        </Button>
      </Card>
    )
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="csv">CSV Upload</TabsTrigger>
        <TabsTrigger value="table">Spreadsheet</TabsTrigger>
      </TabsList>

      {/* CSV */}
      <TabsContent value="csv" className="space-y-4">
        <div className="space-y-3">
          <div className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 p-2 rounded">
            <p className="font-mono">name,phone,email,roomId,rent,deposit</p>
            <p className="font-mono">John Doe,9876543210,john@example.com,101,10000,50000</p>
          </div>

          <textarea
            value={csvContent}
            onChange={(e) => setCSVContent(e.target.value)}
            placeholder="Paste CSV here..."
            className="w-full h-32 p-2 border rounded font-mono text-sm resize-none"
          />

          <Button onClick={handleCSVPreview} variant="outline" className="w-full">
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
                      <p className="font-semibold">{tenant.name}</p>
                      <p className="text-gray-600 dark:text-gray-400">
                        {tenant.phone} • {tenant.email}
                      </p>
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
      </TabsContent>

      <TabsContent value="table" className="space-y-4">
        <div className="space-y-2">
          {tableRows.map((row, index) => (
            <Card key={index} className="p-3 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium">Name *</label>
                  <Input
                    type="text"
                    value={row.name}
                    onChange={(e) => {
                      const newRows = [...tableRows]
                      newRows[index].name = e.target.value
                      setTableRows(newRows)
                    }}
                    placeholder="John Doe"
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium">Phone</label>
                  <Input
                    type="tel"
                    value={row.phone}
                    onChange={(e) => {
                      const newRows = [...tableRows]
                      newRows[index].phone = e.target.value
                      setTableRows(newRows)
                    }}
                    placeholder="9876543210"
                    className="text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium">Email</label>
                <Input
                  type="email"
                  value={row.email}
                  onChange={(e) => {
                    const newRows = [...tableRows]
                    newRows[index].email = e.target.value
                    setTableRows(newRows)
                  }}
                  placeholder="john@example.com"
                  className="text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium">Room ID *</label>
                  <Input
                    type="text"
                    value={row.roomId}
                    onChange={(e) => {
                      const newRows = [...tableRows]
                      newRows[index].roomId = e.target.value
                      setTableRows(newRows)
                    }}
                    placeholder="101"
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium">Rent</label>
                  <Input
                    type="number"
                    value={row.rent || ''}
                    onChange={(e) => {
                      const newRows = [...tableRows]
                      newRows[index].rent = parseInt(e.target.value, 10) || 0
                      setTableRows(newRows)
                    }}
                    placeholder="10000"
                    className="text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium">Deposit</label>
                <Input
                  type="number"
                  value={row.deposit || ''}
                  onChange={(e) => {
                    const newRows = [...tableRows]
                    newRows[index].deposit = parseInt(e.target.value, 10) || 0
                    setTableRows(newRows)
                  }}
                  placeholder="50000"
                  className="text-sm"
                />
              </div>

              {tableRows.length > 1 && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setTableRows(tableRows.filter((_, i) => i !== index))
                  }}
                  className="w-full text-xs"
                >
                  Remove
                </Button>
              )}
            </Card>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setTableRows([
                ...tableRows,
                {
                  rowIndex: tableRows.length + 1,
                  name: '',
                  phone: '',
                  email: '',
                  roomId: '',
                  rent: 0,
                  deposit: 0,
                },
              ])
            }}
            className="w-full"
          >
            + Add Row
          </Button>

          <Button onClick={handleTablePreview} variant="outline" className="w-full">
            Preview
          </Button>
        </div>

        {tablePreview.length > 0 && (
          <Card className="p-3 border-gray-200 space-y-2">
            <p className="text-xs font-semibold">
              Preview: {tablePreview.length} tenants
            </p>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {tablePreview.map((tenant, i) => (
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
                      <p className="font-semibold">{tenant.name}</p>
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
                </div>
              ))}
            </div>
            <Button
              onClick={handleTableSubmit}
              disabled={loading || tablePreview.some((p) => !p.isValid)}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
            >
              {loading && <Spinner className="w-4 h-4 mr-2" />}
              Add Tenants
            </Button>
          </Card>
        )}
      </TabsContent>
    </Tabs>
  )
}
