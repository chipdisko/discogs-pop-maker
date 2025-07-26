export class Price {
  private readonly value: number;
  private readonly currency: string;

  private constructor(value: number, currency: string = "JPY") {
    this.value = value;
    this.currency = currency;
  }

  static create(value: number, currency: string = "JPY"): Price {
    if (value < 0) {
      throw new Error("Price cannot be negative");
    }
    if (value > 999999) {
      throw new Error("Price is too high");
    }
    return new Price(value, currency);
  }

  static fromString(value: string, currency: string = "JPY"): Price {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      throw new Error("Invalid price format");
    }
    return this.create(numValue, currency);
  }

  static empty(): Price {
    return new Price(0, "JPY");
  }

  getValue(): number {
    return this.value;
  }

  getCurrency(): string {
    return this.currency;
  }

  getDisplayValue(): string {
    if (this.value === 0) {
      return "FREE";
    }
    if (this.currency === "JPY") {
      return `¥${this.value.toLocaleString()}`;
    }
    return `${this.currency} ${this.value.toLocaleString()}`;
  }

  isEmpty(): boolean {
    return this.value === 0;
  }

  equals(other: Price): boolean {
    return this.value === other.value && this.currency === other.currency;
  }

  toString(): string {
    return this.getDisplayValue();
  }
}
