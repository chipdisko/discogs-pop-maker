export type ConditionType =
  | "New"
  | "M"
  | "M-"
  | "M--"
  | "EX++"
  | "EX"
  | "VG+"
  | "VG"
  | "Good"
  | "Poor";

export class Condition {
  private readonly value: ConditionType;

  private constructor(value: ConditionType) {
    this.value = value;
  }

  static create(value: ConditionType): Condition {
    return new Condition(value);
  }

  static fromString(value: string): Condition {
    if (this.isValid(value)) {
      return new Condition(value as ConditionType);
    }
    throw new Error(`Invalid condition: ${value}`);
  }

  static isValid(value: string): boolean {
    const validConditions: ConditionType[] = [
      "New",
      "M",
      "M-",
      "M--",
      "EX++",
      "EX",
      "VG+",
      "VG",
      "Good",
      "Poor",
    ];
    return validConditions.includes(value as ConditionType);
  }

  getValue(): ConditionType {
    return this.value;
  }

  equals(other: Condition): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  static getAllConditions(): ConditionType[] {
    return ["New", "M", "M-", "M--", "EX++", "EX", "VG+", "VG", "Good", "Poor"];
  }
}
