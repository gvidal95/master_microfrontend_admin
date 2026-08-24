import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useServices } from '../services/ServicesContext';
import type { ReservationData } from '../types/reservation';
import { formatDate, formatTime } from '../utils/DateTime';

type ReservationManagementProps = {
  userId: number;
};

type ReservationTableProps = {
  reservations: ReservationData[];
  emptyMessage: string;
  showCancelAction?: boolean;
  cancellingReservationId?: number | null;
  onCancel?: (reservation: ReservationData) => void;
};

const ReservationTable = ({
  reservations,
  emptyMessage,
  showCancelAction = false,
  cancellingReservationId = null,
  onCancel,
}: ReservationTableProps) => (
  <TableContainer component={Paper} variant="outlined">
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>ID</TableCell>
          <TableCell>Fecha</TableCell>
          <TableCell>Horario</TableCell>
          <TableCell align="center">Cancha</TableCell>
          <TableCell>Estado</TableCell>
          {showCancelAction
            &&
            <TableCell align="right">Acciones</TableCell>
          }
        </TableRow>
      </TableHead>
      <TableBody>
        {reservations.length === 0 ? (
          <TableRow>
            <TableCell colSpan={showCancelAction ? 6 : 5} align="center" sx={{ py: 4 }}>
              <Typography color="text.secondary">{emptyMessage}</Typography>
            </TableCell>
          </TableRow>
        ) : reservations.map((reservation) => (
          <TableRow key={reservation.reservationId} hover>
            <TableCell sx={{ fontWeight: 600 }}>{reservation.reservationId}</TableCell>
            <TableCell>{formatDate(reservation.reservationDate)}</TableCell>
            <TableCell>
              {formatTime(reservation.reservationStartTime)} - {formatTime(reservation.reservationEndTime)}
            </TableCell>
            <TableCell align="center">#{reservation.reservationCourtId}</TableCell>
            <TableCell>
              <Chip
                label={reservation.reservationState === 'ACTIVO' ? 'Activa' : 'Cancelada'}
                color={reservation.reservationState === 'ACTIVO' ? 'success' : 'default'}
                size="small"
              />
            </TableCell>
            {showCancelAction && (
              <TableCell align="right">
                <Tooltip title="Cancelar reserva">
                  <span>
                    <IconButton
                      color="error"
                      aria-label={`Cancelar reserva ${reservation.reservationId}`}
                      disabled={cancellingReservationId !== null}
                      onClick={() => onCancel?.(reservation)}
                    >
                      {cancellingReservationId === reservation.reservationId
                        ? <CircularProgress size={20} color="inherit" />
                        : <CancelOutlinedIcon fontSize="small" />}
                    </IconButton>
                  </span>
                </Tooltip>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

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
                reservations={activeReservations}
                emptyMessage="No hay reservas activas."
                showCancelAction
                cancellingReservationId={cancellingReservationId}
                onCancel={cancelReservation}
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
