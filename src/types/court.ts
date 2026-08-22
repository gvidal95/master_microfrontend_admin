import type { ScheduleData } from "./schedule";
import type { SportData } from "./sport";

export type CourtData = {
  courtId: number;
  courtName: string;
  courtDescription: string;
  courtCapacity: number;
  courtSportId: number;
  courtPrice: number;
  courtSport: SportData;
  courtSchedules: ScheduleData[];
};

export type CourtSaveData = {
  courtName: string;
  courtDescription: string;
  courtCapacity: number;
  courtSportId: number;
  courtPrice: number;
};
