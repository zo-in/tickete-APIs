import { Price } from "./slot.dto";

export class DateAvailability {
  date!: string;
  price: Price = new Price();
}

export class DateInventory {
  dates: DateAvailability[] = [];
}
