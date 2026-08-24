import type { ReservationData, ReservationSaveData } from '../types/reservation';

/** Ejemplo del modelo utilizado por una reserva. */
export const reservationData: ReservationData = {
  reservationId: 1,
  reservationDate: '2026-08-24',
  reservationStartTime: '17:00:00',
  reservationEndTime: '18:00:00',
  reservationCourtId: 1,
  reservationUserId: 1,
  reservationState: 'ACTIVO',
};

export const reservationDataSave: ReservationSaveData = {
  reservationDate: '2026-08-24',
  reservationStartTime: '17:00:00',
  reservationEndTime: '18:00:00',
  reservationCourtId: 1,
  reservationUserId: 1,
};

/**
 * Almacén temporal de reservas. Al estar separado del servicio se puede sustituir
 * por una llamada al API sin cambiar el contrato consumido por los componentes.
 */
export const mockReservations: ReservationData[] = [reservationData];
