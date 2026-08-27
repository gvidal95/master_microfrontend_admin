export type MaintenanceBlockData = {
  maintenanceBlockId: number;
  maintenanceBlockCourtId: number;
  maintenanceBlockStartDate: string;
  maintenanceBlockEndDate: string;
  maintenanceBlockReason: string;
};

export type MaintenanceBlockSaveData = {
  maintenanceBlockCourtId: number;
  maintenanceBlockStartDate: string;
  maintenanceBlockEndDate: string;
  maintenanceBlockReason: string;
};
