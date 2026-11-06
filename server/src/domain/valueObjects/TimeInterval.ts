
export class TimeInterval {
  public readonly start: string
  public readonly end: string

  private constructor(start: string, end: string) {
    this.start = start
    this.end = end
  }

  static create(start: string, end: string): TimeInterval {
    const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/

    if (!timePattern.test(start) || !timePattern.test(end)) {
      throw new Error('Az időpont formátuma HH:MM legyen.')
    }

    if (start >= end) {
      throw new Error(
        'A kezdési időpontnak korábbinak kell lennie a befejezési időpontnál.',
      )
    }

    return new TimeInterval(start, end)
  }

  overlaps(other: TimeInterval): boolean {
    return this.start < other.end && other.start < this.end
  }
}
