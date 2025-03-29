import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { SyncService } from "../inventory/sync.service";

@Injectable()
export class CronService {
  constructor(private readonly syncService: SyncService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  daily() {
    this.syncService.sync(60);
  }

  @Cron("0 */4 * * *")
  everyFourHours() {
    this.syncService.sync(7);
  }

  @Cron("*/15 * * * *")
  everyFifteenMinutes() {
    this.syncService.sync(1);
  }
}
