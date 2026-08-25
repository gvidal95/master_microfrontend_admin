import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import {
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography
} from '@mui/material';
import type { ReservationData } from '../../types/reservation';
import { formatDate, formatTime } from '../../utils/DateTime';

type ReservationTableProps = {
  reservations: ReservationData[];
  emptyMessage: string;
  finalized?: boolean;
  showCancelAction?: boolean;
  cancellingReservationId?: number | null;
  onCancel?: (reservation: ReservationData) => void;
};


export const ReservationTable = ({
  reservations,
  emptyMessage,
  finalized = false,
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
                label={
                  finalized
                    ? 'Finalizada'
                    : reservation.reservationState === 'ACTIVO' ? 'Activa' : 'Cancelada'}
                color={
                  finalized
                    ? 'info'
                    : reservation.reservationState === 'ACTIVO' ? 'success' : 'default'}
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