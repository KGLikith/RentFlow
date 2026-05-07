import { NextRequest, NextResponse } from 'next/server'

// DELETE /api/tenants/[id]/remove — DISABLED
// Permanent deletion is not allowed. Use /checkout to soft-check-out a tenant.
export async function DELETE(
  _req: NextRequest,
  _ctx: { params: Promise<{ id: string }> }
) {
  return NextResponse.json(
    { error: 'Permanent deletion of tenant records is not allowed. Use POST /api/tenants/[id]/checkout to check out a tenant while preserving their history.' },
    { status: 410 } // 410 Gone — intentionally removed feature
  )
}
