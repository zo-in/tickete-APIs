import { Module } from "@nestjs/common";
import { InventoryService } from "./inventory.service";
import { InventoryController } from "./inventory.controller";
import { SyncService } from "./sync.service";

@Module({
  providers: [InventoryService, SyncService],
  controllers: [InventoryController],
  exports: [SyncService],
})
export class InventoryModule {}
