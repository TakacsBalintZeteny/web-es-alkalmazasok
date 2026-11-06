import type { GuestCount } from '../valueObjects/GuestCount'
import type { TimeInterval } from '../valueObjects/TimeInterval'

export type Booking = {
  id: number
  guestId: number
  tableId: number
  date: string
  timeInterval: TimeInterval
  guestCount: GuestCount
}