/**
 * One-time backfill: set capacity on every room based on its roomType.
 * Run with:  npx tsx scripts/backfill-capacity.ts
 */
import { PrismaClient } from '../app/generated/prisma/client'

const prisma = new PrismaClient()

function roomTypeToCapacity(roomType: string): number {
  const t = roomType.trim().toLowerCase()
  if (t.includes('single'))    return 1
  if (t.includes('double'))    return 2
  if (t.includes('triple'))    return 3
  if (t.includes('quad'))      return 4
  if (t.includes('dormitory')) return 8
  if (t.includes('private'))   return 1
  return 1
}

async function main() {
  const rooms = await prisma.room.findMany({ select: { id: true, roomType: true, capacity: true } })
  console.log(`Found ${rooms.length} rooms to check`)

  let updated = 0
  for (const room of rooms) {
    const expected = roomTypeToCapacity(room.roomType)
    if (room.capacity !== expected) {
      await prisma.room.update({ where: { id: room.id }, data: { capacity: expected } })
      console.log(`  Updated room ${room.id} [${room.roomType}]: ${room.capacity} → ${expected}`)
      updated++
    }
  }

  console.log(`\nDone — ${updated} room(s) updated.`)
}

main().finally(() => prisma.$disconnect())
