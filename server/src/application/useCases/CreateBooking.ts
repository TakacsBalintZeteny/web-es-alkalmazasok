
import type { PrismaClient } from '@prisma/client'
import { GuestCount } from '../../domain/valueObjects/GuestCount.js'
import { TimeInterval } from '../../domain/valueObjects/TimeInterval.js'

type CreateBookingInput = {
  userId: number
  date: string
  time: string
  guests: number
  tableId: number
}

export class BookingUseCaseError extends Error {
  public readonly statusCode: number

  constructor(message: string, statusCode: number) {
    super(message)
    this.name = 'BookingUseCaseError'
    this.statusCode = statusCode
  }
}

export class CreateBooking {
  private readonly prisma: PrismaClient

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
  }

  async execute(input: CreateBookingInput) {
    if (!Number.isInteger(input.userId) || input.userId < 1) {
      throw new BookingUseCaseError('Érvénytelen felhasználó.', 400)
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) {
      throw new BookingUseCaseError(
        'A dátum formátuma YYYY-MM-DD legyen.',
        400,
      )
    }

    const date = new Date(`${input.date}T00:00:00.000Z`)

    if (
      Number.isNaN(date.getTime()) ||
      date.toISOString().slice(0, 10) !== input.date
    ) {
      throw new BookingUseCaseError(
        'Érvénytelen naptári dátum.',
        400,
      )
    }

    if (!Number.isInteger(input.tableId) || input.tableId < 1) {
      throw new BookingUseCaseError('Érvénytelen asztalazonosító.', 400)
    }

    let guestCount: GuestCount
    let interval: TimeInterval

    try {
      guestCount = GuestCount.create(input.guests)

      if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(input.time)) {
        throw new Error('Az időpont formátuma HH:MM legyen.')
      }

      const startMinutes =
        Number(input.time.slice(0, 2)) * 60 +
        Number(input.time.slice(3, 5))

      const endMinutes = startMinutes + 60

      if (endMinutes >= 24 * 60) {
        throw new Error(
          'A foglalás nem nyúlhat át a következő napra.',
        )
      }

      const endTime = [
        String(Math.floor(endMinutes / 60)).padStart(2, '0'),
        String(endMinutes % 60).padStart(2, '0'),
      ].join(':')

      interval = TimeInterval.create(input.time, endTime)
    } catch (error) {
      throw new BookingUseCaseError(
        error instanceof Error
          ? error.message
          : 'Érvénytelen foglalási adatok.',
        400,
      )
    }

    return this.prisma.$transaction(async (tx) => {
      // A bejelentkezett felhasználó lekérése.
      const user = await tx.user.findUnique({
        where: { id: input.userId },
      })

      if (!user) {
        throw new BookingUseCaseError(
          'A felhasználó nem található.',
          404,
        )
      }

      const dayOfWeek = date.getUTCDay()

      const openingHours = await tx.openingHours.findFirst({
        where: { dayOfWeek },
      })

      if (!openingHours) {
        throw new BookingUseCaseError(
          'Ehhez a naphoz nincs beállítva nyitvatartás.',
          500,
        )
      }

      if (
        interval.start < openingHours.startTime ||
        interval.end > openingHours.endTime
      ) {
        throw new BookingUseCaseError(
          `A foglalás csak ${openingHours.startTime} és ${openingHours.endTime} között lehetséges.`,
          400,
        )
      }

      const table = await tx.table.findUnique({
        where: { id: input.tableId },
      })

      if (!table) {
        throw new BookingUseCaseError(
          'A kiválasztott asztal nem található.',
          404,
        )
      }

      if (guestCount.value > table.capacity) {
        throw new BookingUseCaseError(
          'A vendégek száma meghaladja az asztal kapacitását.',
          400,
        )
      }

      const existingBookings = await tx.booking.findMany({
        where: {
          tableId: input.tableId,
          date,
        },
        select: {
          startTime: true,
          endTime: true,
        },
      })

      const hasOverlap = existingBookings.some((booking) => {
        const existingInterval = TimeInterval.create(
          booking.startTime,
          booking.endTime,
        )

        return interval.overlaps(existingInterval)
      })

      if (hasOverlap) {
        throw new BookingUseCaseError(
          'Erre az asztalra ebben az időpontban már van foglalás.',
          409,
        )
      }

      // A Guest rekord továbbra is megmarad a meglévő adatmodell miatt.
      const guest = await tx.guest.create({
        data: {
          name: user.name,
        },
      })

      return tx.booking.create({
        data: {
          guestId: guest.id,
          tableId: input.tableId,
          userId: user.id,
          date,
          startTime: interval.start,
          endTime: interval.end,
          guestCount: guestCount.value,
        },
        include: {
          guest: true,
          table: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })
    })
  }
}
