import type { MaintenanceBlockData } from "./maintenanceBlock";
import type { ScheduleData } from "./schedule";
import type { SportData } from "./sport";

export type CourtData = {
  courtId: number;
  courtName: string;
  courtDescription: string;
  courtCapacity: number;
  courtSportId: number;
  courtPrice: number;
  courtActive: boolean;
  courtSport: SportData;
  courtSchedules: ScheduleData[];
  courtMaintenanceBlocks: MaintenanceBlockData[];
};

export type CourtSaveData = {
  courtName: string;
  courtDescription: string;
  courtCapacity: number;
  courtSportId: number;
  courtPrice: number;
};
