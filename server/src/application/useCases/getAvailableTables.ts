
import type { PrismaClient } from '@prisma/client'

type GetAvailableTablesInput = {
  date: string
  time: string
  guests: number
}

export async function getAvailableTables(
  prisma: PrismaClient,
  input: GetAvailableTablesInput,
) {
  // 1. Bemeneti adatok ellenőrzése
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) {
    throw new Error('Érvénytelen dátum.')
  }

  const date = new Date(`${input.date}T00:00:00.000Z`)

  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== input.date
  ) {
    throw new Error('Érvénytelen dátum.')
  }

  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(input.time)) {
    throw new Error('Érvénytelen időpont.')
  }

  if (!Number.isInteger(input.guests) || input.guests < 1) {
    throw new Error('A vendégek száma legalább 1 fő kell legyen.')
  }

  // 2. Egyórás foglalási időintervallum kiszámítása
  const [hours, minutes] = input.time.split(':').map(Number)

  const startMinutes = hours * 60 + minutes
  const endMinutes = startMinutes + 60

  if (endMinutes > 24 * 60) {
    throw new Error('A foglalás nem nyúlhat át a következő napra.')
  }

  const endTime = `${String(Math.floor(endMinutes / 60)).padStart(2, '0')}:${String(
    endMinutes % 60,
  ).padStart(2, '0')}`

  // 3. Nyitvatartás ellenőrzése
  const dayOfWeek = date.getUTCDay()

  const openingHours = await prisma.openingHours.findFirst({
    where: {
      dayOfWeek,
    },
  })

  if (!openingHours) {
    throw new Error('Erre a napra nincs megadva nyitvatartás.')
  }

  if (
    input.time < openingHours.startTime ||
    endTime > openingHours.endTime
  ) {
    throw new Error('A kiválasztott időpont kívül esik a nyitvatartáson.')
  }

  // 4. Asztalok és az adott napi foglalások lekérése
  const [tables, bookings] = await Promise.all([
    prisma.table.findMany(),
    prisma.booking.findMany({
      where: {
        date,
      },
    }),
  ])

  // 5. Szabad asztalok kiválasztása
  const availableTables = tables.filter((table) => {
    // Az asztalnak elegendő férőhellyel kell rendelkeznie.
    if (table.capacity < input.guests) {
      return false
    }

    // Ellenőrizzük, hogy van-e időbeli ütközés.
    const hasConflict = bookings.some((booking) => {
      if (booking.tableId !== table.id) {
        return false
      }

      return (
        booking.startTime < endTime &&
        input.time < booking.endTime
      )
    })

    return !hasConflict
  })

  // 6. Optimális sorrend:
  // a legkisebb, még megfelelő kapacitású asztal legyen elöl.
  availableTables.sort((a, b) => {
    if (a.capacity !== b.capacity) {
      return a.capacity - b.capacity
    }

    return a.id - b.id
  })

  return availableTables
}
