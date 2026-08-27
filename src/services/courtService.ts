import type { CourtData, CourtSaveData } from '../types/court';
import type { MaintenanceBlockData, MaintenanceBlockSaveData } from '../types/maintenanceBlock';
import type { ScheduleData, ScheduleSaveData } from '../types/schedule';
import { createApiClient } from './apiClient';

/** Servicio HTTP para las operaciones relacionadas con canchas y sus horarios. */
export const createCourtService = (token: string) => {
  const courtApi = createApiClient('http://localhost:8080/courts/api', token);

  return {
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

    /** Activa o inactiva una cancha. */
    updateCourtActive: async (courtId: number, active: boolean): Promise<CourtData> => {
      const { data } = await courtApi.patch<CourtData>(`/courts/${courtId}/active`, { courtActive: active });
      return data;
    },

    /** Crea un bloqueo de mantenimiento para una cancha. */
    createMaintenanceBlock: async (block: MaintenanceBlockSaveData): Promise<MaintenanceBlockData> => {
      const { data } = await courtApi.post<MaintenanceBlockData>('/maintenance-blocks', block);
      return data;
    },

    /** Elimina un bloqueo de mantenimiento. */
    deleteMaintenanceBlock: async (maintenanceBlockId: number): Promise<void> => {
      await courtApi.delete(`/maintenance-blocks/${maintenanceBlockId}`);
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
};

export type CourtService = ReturnType<typeof createCourtService>;
