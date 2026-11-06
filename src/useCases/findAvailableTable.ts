import type { Booking } from '../domain/entities/Booking'
import type { Table } from '../domain/entities/Table'
import type { GuestCount } from '../domain/valueObjects/GuestCount'
import type { TimeInterval } from '../domain/valueObjects/TimeInterval'

type FindAvailableTableInput = {
  date: string
  timeInterval: TimeInterval
  guestCount: GuestCount
}

export function findAvailableTable(
  tables: Table[],
  bookings: Booking[],
  input: FindAvailableTableInput,
): Table[] {
  return tables
    .filter((table) => {
      if (table.capacity < input.guestCount.value) {
        return false
      }

      const hasConflict = bookings.some((booking) => {
        return (
          booking.tableId === table.id &&
          booking.date === input.date &&
          booking.timeInterval.overlaps(input.timeInterval)
        )
      })

      return !hasConflict
    })
    .sort((a, b) => {
      if (a.capacity !== b.capacity) {
        return a.capacity - b.capacity
      }

      return a.id - b.id
    })
}