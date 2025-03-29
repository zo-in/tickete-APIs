import { Injectable } from "@nestjs/common";
import axios from "axios";
import dayjs from "dayjs";
import { PrismaService } from "../prisma/prisma.service";

const PRODUCTS = [
  { id: 14, name: "Product 14", days: ["MONDAY", "TUESDAY", "WEDNESDAY"] },
  { id: 15, name: "Product 15", days: ["SUNDAY"] },
];

@Injectable()
export class SyncService {
  constructor(private readonly prisma: PrismaService) {}

  async sync(daysAhead = 60) {
    const today = dayjs();

    for (const product of PRODUCTS) {
      await this.prisma.product.upsert({
        where: { id: product.id },
        update: { name: product.name, activeDays: product.days.join(",") },
        create: {
          id: product.id,
          name: product.name,
          activeDays: product.days.join(","),
        },
      });

      for (let i = 0; i < daysAhead; i++) {
        const date = today.add(i, "day");
        const dayOfWeek = date.format("dddd").toUpperCase();

        if (!product.days.includes(dayOfWeek)) continue;

        const dateStr = date.format("YYYY-MM-DD");

        try {
          const res = await axios.get(
            `https://leap-api.tickete.co/api/v1/inventory/${product.id}?date=${dateStr}`,
            {
              headers: {
                "x-api-key": process.env.TICKETE_API_KEY,
              },
            }
          );

          const data = res.data;

          for (const slot of data) {
            const variant = await this.prisma.variant.upsert({
              where: { id: slot.variantId },
              update: {},
              create: {
                id: slot.variantId,
                productId: product.id,
                paxType: slot.paxAvailability[0].type,
                name: slot.paxAvailability[0].name,
                paxDesc: slot.paxAvailability[0].description,
                paxMin: slot.paxAvailability[0].min,
                paxMax: slot.paxAvailability[0].max,
                paxPrimary: slot.paxAvailability[0].isPrimary,
              },
            });

            await this.prisma.slot.create({
              data: {
                productId: product.id,
                variantId: variant.id,
                startDate: new Date(slot.startDate),
                startTime: slot.startTime,
                endTime: slot.endTime,
                providerSlotId: slot.providerSlotId,
                remaining: slot.remaining,
                isClosed: slot.isClosed,
              },
            });

            for (const pax of slot.paxAvailability) {
              await this.prisma.price.upsert({
                where: { id: pax.priceId },
                update: {},
                create: {
                  id: pax.priceId,
                  currencyCode: pax.price.currencyCode,
                  finalPrice: pax.price.finalPrice,
                  originalPrice: pax.price.originalPrice,
                  discount: pax.price.discount,
                  variantId: slot.variantId,
                },
              });
            }
          }

          console.log(`✅ Synced product ${product.id} on ${dateStr}`);
        } catch (err) {
          if (err instanceof Error) {
            console.error(
              `❌ Failed to sync product ${product.id} on ${dateStr}`,
              err.message
            );
          } else {
            console.error(
              `❌ Failed to sync product ${product.id} on ${dateStr}`,
              err
            );
          }
        }

        // Delay to respect 30 req/min rate limit
        await new Promise((res) => setTimeout(res, 2200)); // ~27 RPM
      }
    }
  }
}
