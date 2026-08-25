import {
  Alert,
  Box,
  CircularProgress,
  Paper,
  Stack,
  Typography
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useServices } from '../services/ServicesContext';
import type { ReservationData } from '../types/reservation';
import { ReservationTable } from './tables/ReservationTable';

type ReservationManagementProps = {
  userId: number;
};

export const ReservationManagement = ({ userId }: ReservationManagementProps) => {
  const { reservationService } = useServices();
  const [activeReservations, setActiveReservations] = useState<ReservationData[]>([]);
  const [cancelledReservations, setCancelledReservations] = useState<ReservationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [areCancelledLoading, setAreCancelledLoading] = useState(true);
  const [cancelledLoadError, setCancelledLoadError] = useState('');
  const [cancellingReservationId, setCancellingReservationId] = useState<number | null>(null);
  const [cancelError, setCancelError] = useState('');

  const now = new Date();
  const currentDate = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-');

  const finalizedReservations = activeReservations.filter(
    (reservation) => reservation.reservationDate.slice(0, 10) < currentDate,
  );
  const currentActiveReservations = activeReservations.filter(
    (reservation) => reservation.reservationDate.slice(0, 10) >= currentDate,
  );

  useEffect(() => {
    let isCurrent = true;

    setIsLoading(true);
    setLoadError('');
    setAreCancelledLoading(true);
    setCancelledLoadError('');
    reservationService.getAllActiveReservations()
      .then((reservations) => {
        if (isCurrent) setActiveReservations(reservations);
      })
      .catch(() => {
        if (isCurrent) setLoadError('No se pudieron cargar las reservas activas. Inténtalo nuevamente.');
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    reservationService.getAllCancelledReservationsByUser()
      .then((reservations) => {
        if (isCurrent) setCancelledReservations(reservations);
      })
      .catch(() => {
        if (isCurrent) setCancelledLoadError('No se pudieron cargar las reservas canceladas. Inténtalo nuevamente.');
      })
      .finally(() => {
        if (isCurrent) setAreCancelledLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [reservationService, userId]);

  const cancelReservation = async (reservation: ReservationData) => {
    setCancellingReservationId(reservation.reservationId);
    setCancelError('');

    try {

      await reservationService.cancelReservation(reservation.reservationId);
      setActiveReservations((current) => current.filter(
        (item) => item.reservationId !== reservation.reservationId,
      ));
      setCancelledReservations((current) => [
        ...current,
        { ...reservation, reservationState: 'CANCELADO' },
      ]);
    } catch {
      setCancelError('No se pudo cancelar la reserva. Inténtalo nuevamente.');
    } finally {
      setCancellingReservationId(null);
    }
  };

  return (
    <Box sx={{ maxWidth: 1180, mx: 'auto', py: 2 }}>
      <Stack spacing={4}>
        <Box>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>Reservas activas</Typography>
          </Box>
          {loadError && <Alert severity="error" sx={{ mb: 2 }}>{loadError}</Alert>}
          {cancelError && <Alert severity="error" sx={{ mb: 2 }}>{cancelError}</Alert>}
          {isLoading
            ? (
              <Paper variant="outlined">
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                  <CircularProgress />
                </Box>
              </Paper>
            ) : (
              <ReservationTable
                reservations={currentActiveReservations}
                emptyMessage="No hay reservas activas."
                showCancelAction
                cancellingReservationId={cancellingReservationId}
                onCancel={cancelReservation}
              />
            )}
        </Box>

        <Box>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>Reservas finalizadas</Typography>
          </Box>
          {loadError && <Alert severity="error" sx={{ mb: 2 }}>{loadError}</Alert>}
          {isLoading
            ? (
              <Paper variant="outlined">
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                  <CircularProgress />
                </Box>
              </Paper>
            ) : (
              <ReservationTable
                reservations={finalizedReservations}
                emptyMessage="No hay reservas finalizadas."
                finalized
              />
            )}
        </Box>

        <Box>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>Reservas canceladas</Typography>
          </Box>
          {cancelledLoadError && <Alert severity="error" sx={{ mb: 2 }}>{cancelledLoadError}</Alert>}
          {areCancelledLoading ?
            (
              <Paper variant="outlined">
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                  <CircularProgress />
                </Box>
              </Paper>
            ) : (
              <ReservationTable
                reservations={cancelledReservations}
                emptyMessage="No hay reservas canceladas."
              />
            )}
        </Box>
      </Stack>
    </Box>
  );
};
