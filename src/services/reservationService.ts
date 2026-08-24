import type { reservationDataSave } from '../data/reservation';
import type { ReservationData } from '../types/reservation';
import { createApiClient } from './apiClient';

/** Servicio de reservas con almacenamiento mock y una interfaz compatible con HTTP. */
export const createReservationService = (token: string) => {
  const reservationApi = createApiClient('http://localhost:8083/reservations/api/', token);

  return {
    /** Obtiene las reservas activas que bloquean horarios en una fecha. */
    getOccupiedReservationsByDate: async (date: string): Promise<ReservationData[]> => {
      const { data } = await reservationApi.get<ReservationData[]>('reservations/active', {
        params: { date },
      });
      return data;
    },

    /** Obtiene todas las reservas activas pertenecientes. */
    getAllActiveReservations: async (): Promise<ReservationData[]> => {
      const { data } = await reservationApi.get<ReservationData[]>(`reservations/active/all`);
      return data;
    },

    /** Obtiene todas las reservas canceladas. */
    getAllCancelledReservationsByUser: async (): Promise<ReservationData[]> => {
      const { data } = await reservationApi.get<ReservationData[]>(`reservations/canceled/all`);
      return data;
    },

    /** Cancela una reserva existente. */
    cancelReservation: async (reservationId: number): Promise<void> => {
      await reservationApi.patch(`reservations/${reservationId}/cancel`);
    },

    /** Guarda una reserva mediante el API de reservaciones. */
    saveReservation: async (reservation: typeof reservationDataSave): Promise<ReservationData> => {
      const { data } = await reservationApi.post<ReservationData>('reservations', reservation);
      return data;
    },
  };
};

export type ReservationService = ReturnType<typeof createReservationService>;
