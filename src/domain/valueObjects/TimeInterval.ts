export class TimeInterval {
  public readonly start: string
  public readonly end: string

  private constructor(start: string, end: string) {
    this.start = start
    this.end = end
  }

  static create(start: string, end: string): TimeInterval {
    if (!start || !end) {
      throw new Error('A kezdési és befejezési időpont kötelező.')
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