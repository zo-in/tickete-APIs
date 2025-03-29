export class Price {
  finalPrice!: number;
  currencyCode!: string;
  originalPrice!: number;
}

export class PaxAvailability {
  type!: string;
  name?: string;
  description?: string;
  price!: Price;
  min?: number;
  max?: number;
  remaining!: number;
}

export class Slot {
  startTime!: string;
  startDate!: string;
  price!: Price;
  remaining!: number;
  paxAvailability!: PaxAvailability[];
}
