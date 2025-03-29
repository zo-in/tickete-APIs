import { Controller, Get, Param, Post, Query } from "@nestjs/common";
import { InventoryService } from "./inventory.service";
import { SyncService } from "./sync.service";

@Controller("api/v1/experience")
export class InventoryController {
  constructor(
    private readonly service: InventoryService,
    private readonly syncService: SyncService
  ) {}

  @Get(":id/dates")
  async getDates(@Param("id") id: string) {
    return this.service.getDates(Number(id));
  }

  @Get(":id/slots")
  async getSlots(@Param("id") id: string, @Query("date") date: string) {
    return this.service.getSlots(Number(id), date);
  }

  // Creating a temporary route call to syncService to populate the DB.
  @Post("/sync")
  async triggerSync() {
    await this.syncService.sync(2); // next 2 days for quick testing
    return { message: "Sync complete" };
  }
}
