import { Module } from "@nestjs/common";
import { InventoryController } from "./inventory.controller";
import { InventoryService } from "./inventory.service";
import { SyncService } from "./sync.service";

@Module({
  controllers: [InventoryController],
  providers: [InventoryService, SyncService],
  exports: [SyncService],
})
export class InventoryModule {}
