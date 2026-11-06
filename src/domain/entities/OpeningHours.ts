import type { TimeInterval } from '../valueObjects/TimeInterval'

export type OpeningHours = {
  dayOfWeek: number
  interval: TimeInterval
}