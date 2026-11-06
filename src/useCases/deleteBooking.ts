import type { Booking } from '../domain/entities/Booking'

export function deleteBooking(
  bookings: Booking[],
  bookingId: number,
): Booking[] {
  return bookings.filter(
    (booking) => booking.id !== bookingId,
  )
}