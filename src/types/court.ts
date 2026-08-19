import type { ScheduleData } from "./schedule";
import type { SportData } from "./sport";

export type CourtData = {
  courtId: number;
  courtName: string;
  courtDescription: string;
  courtCapacity: number;
  courtSportId: number;
  courtPrice: number;
  sport: SportData;
  schedules: ScheduleData []
};
