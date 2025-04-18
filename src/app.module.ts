import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { PrismaModule } from "./prisma/prisma.module";
import { InventoryModule } from "./inventory/inventory.module";
import { CronService } from "./cron/cron.service";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    InventoryModule,
  ],
  providers: [CronService],
})
export class AppModule {}
