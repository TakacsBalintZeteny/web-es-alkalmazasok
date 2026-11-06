import type { Booking } from '../domain/entities/Booking'
import type { Guest } from '../domain/entities/Guest'
import type { Table } from '../domain/entities/Table'
import type { GuestCount } from '../domain/valueObjects/GuestCount'
import type { TimeInterval } from '../domain/valueObjects/TimeInterval'

type CreateBookingInput = {
  guest: Guest
  table: Table
  date: string
  timeInterval: TimeInterval
  guestCount: GuestCount
}

export function createBooking(
  bookings: Booking[],
  input: CreateBookingInput,
): Booking[] {
  if (input.guestCount.value > input.table.capacity) {
    throw new Error(
      `Ez az asztal legfeljebb ${input.table.capacity} fő számára alkalmas.`,
    )
  }

  const hasConflict = bookings.some((booking) => {
    return (
      booking.tableId === input.table.id &&
      booking.date === input.date &&
      booking.timeInterval.overlaps(input.timeInterval)
    )
  })

  if (hasConflict) {
    throw new Error(
      'Ez az asztal ebben az időpontban már foglalt.',
    )
  }

  const newBooking: Booking = {
    id: Date.now(),
    guestId: input.guest.id,
    tableId: input.table.id,
    date: input.date,
    timeInterval: input.timeInterval,
    guestCount: input.guestCount,
  }

  return [...bookings, newBooking]
}