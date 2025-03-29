import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import dayjs from "dayjs";

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async getDates(productId: number) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    const slots = await this.prisma.slot.findMany({
      where: { productId },
      include: {
        variant: {
          include: {
            prices: true,
          },
        },
      },
    });

    if (slots.length === 0) {
      throw new NotFoundException(
        `No inventory slots found for product ${productId}`
      );
    }

    const grouped = new Map<
      string,
      { price: number; currencyCode: string; originalPrice: number }
    >();

    for (const slot of slots) {
      const date = slot.startDate.toISOString().split("T")[0];
      const priceObj = slot.variant.prices[0];

      if (!priceObj) continue;

      const current = grouped.get(date);
      const finalPrice = priceObj.finalPrice;
      const originalPrice = priceObj.originalPrice;
      const currencyCode = priceObj.currencyCode;

      if (!current || current.price > finalPrice) {
        grouped.set(date, {
          price: finalPrice,
          originalPrice,
          currencyCode,
        });
      }
    }

    const dates = Array.from(grouped.entries()).map(([date, priceData]) => ({
      date,
      price: {
        finalPrice: priceData.price,
        originalPrice: priceData.originalPrice,
        currencyCode: priceData.currencyCode,
      },
    }));

    if (dates.length === 0) {
      throw new NotFoundException(
        `No price data available for any date for product ${productId}`
      );
    }

    return { dates };
  }

  async getSlots(productId: number, date: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    if (!dayjs(date, "YYYY-MM-DD", true).isValid()) {
      throw new BadRequestException(
        `Invalid date format. Expected YYYY-MM-DD.`
      );
    }

    const slots = await this.prisma.slot.findMany({
      where: {
        productId,
        startDate: new Date(date),
      },
      include: {
        variant: {
          include: {
            prices: true,
          },
        },
      },
    });

    if (slots.length === 0) {
      throw new NotFoundException(
        `No slots found for product ${productId} on ${date}`
      );
    }

    const formattedSlots = slots
      .filter((slot) => slot.variant.prices.length > 0)
      .map((slot) => {
        const basePrice = slot.variant.prices[0];

        return {
          startDate: slot.startDate.toISOString().split("T")[0],
          startTime: slot.startTime,
          remaining: slot.remaining,
          price: {
            finalPrice: basePrice.finalPrice,
            originalPrice: basePrice.originalPrice,
            currencyCode: basePrice.currencyCode,
          },
          paxAvailability: [
            {
              type: slot.variant.paxType,
              name: slot.variant.name,
              description: slot.variant.paxDesc,
              price: {
                finalPrice: basePrice.finalPrice,
                originalPrice: basePrice.originalPrice,
                currencyCode: basePrice.currencyCode,
              },
              min: slot.variant.paxMin,
              max: slot.variant.paxMax,
              remaining: slot.remaining,
            },
          ],
        };
      });

    if (formattedSlots.length === 0) {
      throw new NotFoundException(
        `Slots exist but no valid pricing data found for product ${productId} on ${date}`
      );
    }

    return formattedSlots;
  }
}
