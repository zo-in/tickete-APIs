import { Controller, Get, Param, Query } from "@nestjs/common";
import { InventoryService } from "./inventory.service";
import { SyncService } from "./sync.service";

@Controller("api/v1/experience")
export class InventoryController {
  constructor(
    private readonly service: InventoryService,
    private readonly syncService: SyncService
  ) {}

  // ✅ Base ping route (for debugging deployment)
  @Get("ping")
  ping() {
    return { message: "pong" };
  }

  // ✅ GET /api/v1/experience/:id/dates
  @Get(":id/dates")
  getDates(@Param("id") id: string) {
    return this.service.getDates(Number(id));
  }

  // ✅ GET /api/v1/experience/:id/slots?date=YYYY-MM-DD
  @Get(":id/slots")
  getSlots(@Param("id") id: string, @Query("date") date: string) {
    return this.service.getSlots(Number(id), date);
  }

  // ✅ Optional manual sync trigger
  @Get("sync")
  async triggerSync() {
    await this.syncService.sync(2); // next 2 days
    return { message: "Manual sync complete" };
  }
}
