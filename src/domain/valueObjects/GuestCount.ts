export class GuestCount {
  public readonly value: number

  private constructor(value: number) {
    this.value = value
  }

  static create(value: number): GuestCount {
    if (!Number.isInteger(value) || value < 1) {
      throw new Error('A vendégek száma legalább 1 fő kell legyen.')
    }

    return new GuestCount(value)
  }
}