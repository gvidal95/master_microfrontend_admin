import axios from 'axios';
import type { CourtData } from '../types/court';
import type { ScheduleData, ScheduleSaveData } from '../types/schedule';

const courtApi = axios.create({
  baseURL: 'http://localhost:8081/courts/api',
});

/** Servicio HTTP para las operaciones relacionadas con canchas y sus horarios. */
export const courtService = {
  /** Obtiene las canchas junto con sus datos de deporte y horarios. */
  getCourts: async (): Promise<CourtData[]> => {
    const { data } = await courtApi.get<CourtData[]>('/courts');
    return data;
  },

  /** Crea un horario para una cancha. */
  saveSchedule: async (schedule: ScheduleSaveData): Promise<ScheduleData> => {
    const { data } = await courtApi.post<ScheduleData>('/schedules', schedule);
    return data;
  },

  /** Actualiza un horario existente. */
  updateSchedule: async (scheduleId: number, schedule: ScheduleSaveData): Promise<ScheduleData> => {
    const { data } = await courtApi.put<ScheduleData>(`/schedules/${scheduleId}`, schedule);
    return data;
  },
};
