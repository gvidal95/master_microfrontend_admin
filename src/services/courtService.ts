import axios from 'axios';
import type { CourtData, CourtSaveData } from '../types/court';
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

  /** Crea una cancha. */
  createCourt: async (court: CourtSaveData): Promise<CourtData> => {
    const { data } = await courtApi.post<CourtData>('/courts', court);
    return data;
  },

  /** Actualiza una cancha existente. */
  updateCourt: async (courtId: number, court: CourtSaveData): Promise<CourtData> => {
    const { data } = await courtApi.put<CourtData>(`/courts/${courtId}`, court);
    return data;
  },

  /** Elimina una cancha. */
  deleteCourt: async (courtId: number): Promise<void> => {
    await courtApi.delete(`/courts/${courtId}`);
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
