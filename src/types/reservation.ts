export type ReservationState = 'ACTIVO' | 'CANCELADO';

/** Modelo de una reserva tal como se almacena y se recibe desde el servicio. */
export type ReservationData = {
  reservationId: number;
  reservationDate: string;
  reservationStartTime: string;
  reservationEndTime: string;
  reservationCourtId: number;
  reservationUserId: number;
  reservationState: ReservationState;
};

/** Datos necesarios para crear una reserva nueva. */
export type ReservationSaveData = Pick<
  ReservationData,
  | 'reservationDate'
  | 'reservationStartTime'
  | 'reservationEndTime'
  | 'reservationCourtId'
  | 'reservationUserId'
>;
