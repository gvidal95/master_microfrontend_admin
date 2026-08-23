import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import SportsRoundedIcon from '@mui/icons-material/SportsRounded';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { useServices } from '../services/ServicesContext';
import type { CourtData, CourtSaveData } from '../types/court';
import type { SportData } from '../types/sport';

type CourtManagementProps = {
  selectedCourtId: number | null;
  onManageSchedule: (court: CourtData) => void;
  /** Última versión conocida de la cancha seleccionada (p. ej. tras guardar un horario), para mantener la tabla sincronizada. */
  syncedCourt?: CourtData | null;
};

type CourtFormState = {
  courtName: string;
  courtDescription: string;
  courtCapacity: string;
  courtSportId: string;
  courtPrice: string;
};

const emptyForm: CourtFormState = {
  courtName: '',
  courtDescription: '',
  courtCapacity: '',
  courtSportId: '',
  courtPrice: '',
};

const toFormState = (court: CourtData): CourtFormState => ({
  courtName: court.courtName,
  courtDescription: court.courtDescription,
  courtCapacity: String(court.courtCapacity),
  courtSportId: String(court.courtSportId),
  courtPrice: String(court.courtPrice),
});

const currencyFormatter = new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' });

export const CourtManagement = ({ selectedCourtId, onManageSchedule, syncedCourt }: CourtManagementProps) => {
  const { courtService, sportService } = useServices();
  const [courts, setCourts] = useState<CourtData[]>([]);
  const [sports, setSports] = useState<SportData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [courtToEdit, setCourtToEdit] = useState<CourtData | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState<CourtFormState>(emptyForm);
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [courtToDelete, setCourtToDelete] = useState<CourtData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const [isSportDialogOpen, setIsSportDialogOpen] = useState(false);
  const [newSportName, setNewSportName] = useState('');
  const [sportError, setSportError] = useState('');
  const [isSavingSport, setIsSavingSport] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');
    try {
      const [courtsResult, sportsResult] = await Promise.all([courtService.getCourts(), sportService.getSports()]);
      setCourts(courtsResult);
      setSports(sportsResult);
    } catch {
      setLoadError('No se pudo cargar la información de canchas. Inténtalo nuevamente.');
    } finally {
      setIsLoading(false);
    }
  }, [courtService, sportService]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!syncedCourt) return;
    setCourts((current) => current.map((court) => (
      court.courtId === syncedCourt.courtId ? syncedCourt : court
    )));
  }, [syncedCourt]);

  const openCreateForm = () => {
    setCourtToEdit(null);
    setForm({ ...emptyForm, courtSportId: sports[0] ? String(sports[0].sportId) : '' });
    setFormError('');
    setIsFormOpen(true);
  };

  const openEditForm = (court: CourtData) => {
    setCourtToEdit(court);
    setForm(toFormState(court));
    setFormError('');
    setIsFormOpen(true);
  };

  const closeForm = () => {
    if (isSaving) return;
    setIsFormOpen(false);
  };

  const submitForm = async () => {
    const courtCapacity = Number(form.courtCapacity);
    const courtSportId = Number(form.courtSportId);
    const courtPrice = Number(form.courtPrice);

    if (!form.courtName.trim()) {
      setFormError('El nombre de la cancha es obligatorio.');
      return;
    }
    if (!form.courtSportId) {
      setFormError('Selecciona un deporte para la cancha.');
      return;
    }
    if (!Number.isInteger(courtCapacity) || courtCapacity <= 0) {
      setFormError('La capacidad debe ser un número entero mayor a 0.');
      return;
    }
    if (Number.isNaN(courtPrice) || courtPrice < 0) {
      setFormError('El precio debe ser un número válido.');
      return;
    }

    const payload: CourtSaveData = {
      courtName: form.courtName.trim(),
      courtDescription: form.courtDescription.trim(),
      courtCapacity,
      courtSportId,
      courtPrice,
    };

    setIsSaving(true);
    setFormError('');
    try {
      const savedCourt = courtToEdit
        ? await courtService.updateCourt(courtToEdit.courtId, payload)
        : await courtService.createCourt(payload);

      setCourts((current) => (
        courtToEdit
          ? current.map((court) => (court.courtId === savedCourt.courtId ? savedCourt : court))
          : [...current, savedCourt]
      ));
      setIsFormOpen(false);
    } catch {
      setFormError(courtToEdit
        ? 'No se pudo actualizar la cancha. Inténtalo nuevamente.'
        : 'No se pudo crear la cancha. Inténtalo nuevamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!courtToDelete) return;
    setIsDeleting(true);
    setDeleteError('');
    try {
      await courtService.deleteCourt(courtToDelete.courtId);
      setCourts((current) => current.filter((court) => court.courtId !== courtToDelete.courtId));
      setCourtToDelete(null);
    } catch {
      setDeleteError('No se pudo eliminar la cancha. Verifica que no tenga reservas asociadas e inténtalo nuevamente.');
    } finally {
      setIsDeleting(false);
    }
  };

  const submitNewSport = async () => {
    if (!newSportName.trim()) {
      setSportError('El nombre del deporte es obligatorio.');
      return;
    }
    setIsSavingSport(true);
    setSportError('');
    try {
      const savedSport = await sportService.createSport(newSportName.trim());
      setSports((current) => [...current, savedSport]);
      setNewSportName('');
    } catch {
      setSportError('No se pudo crear el deporte. Inténtalo nuevamente.');
    } finally {
      setIsSavingSport(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 1180, mx: 'auto', py: 2 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3, justifyContent: 'space-between', alignItems: { sm: 'center' } }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Catálogo de canchas</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Crea, edita y elimina las canchas disponibles para reserva.</Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<SportsRoundedIcon />} onClick={() => setIsSportDialogOpen(true)}>
            Deportes
          </Button>
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={openCreateForm} disabled={isLoading}>
            Nueva cancha
          </Button>
        </Stack>
      </Stack>

      {loadError && <Alert severity="error" sx={{ mb: 2 }}>{loadError}</Alert>}

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : courts.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">
            {sports.length === 0
              ? 'Aún no hay deportes registrados. Crea uno desde el botón "Deportes" para poder registrar canchas.'
              : 'Aún no hay canchas registradas. Crea la primera con el botón "Nueva cancha".'}
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Deporte</TableCell>
                <TableCell align="center">Capacidad</TableCell>
                <TableCell align="right">Precio</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {courts.map((court) => (
                <TableRow key={court.courtId} selected={court.courtId === selectedCourtId} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{court.courtName}</TableCell>
                  <TableCell><Chip label={court.courtSport?.sportName ?? '—'} size="small" /></TableCell>
                  <TableCell align="center">{court.courtCapacity}</TableCell>
                  <TableCell align="right">{currencyFormatter.format(court.courtPrice)}</TableCell>
                  <TableCell sx={{ maxWidth: 260, color: 'text.secondary' }}>{court.courtDescription || '—'}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Gestionar horarios">
                      <IconButton color={court.courtId === selectedCourtId ? 'primary' : 'default'} onClick={() => onManageSchedule(court)}>
                        <ScheduleRoundedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Editar cancha">
                      <IconButton onClick={() => openEditForm(court)}>
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar cancha">
                      <IconButton color="error" onClick={() => { setCourtToDelete(court); setDeleteError(''); }}>
                        <DeleteOutlineRoundedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Modal de creación/edición de cancha */}
      <Dialog open={isFormOpen} onClose={closeForm} fullWidth maxWidth="sm">
        <DialogTitle>{courtToEdit ? 'Editar cancha' : 'Nueva cancha'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Nombre" value={form.courtName}
              onChange={(event) => setForm((current) => ({ ...current, courtName: event.target.value }))}
              fullWidth required
            />
            <TextField
              label="Descripción" value={form.courtDescription}
              onChange={(event) => setForm((current) => ({ ...current, courtDescription: event.target.value }))}
              fullWidth multiline minRows={2}
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                select label="Deporte" value={form.courtSportId}
                onChange={(event) => setForm((current) => ({ ...current, courtSportId: event.target.value }))}
                fullWidth required disabled={sports.length === 0}
                helperText={sports.length === 0 ? 'Crea un deporte primero desde el botón "Deportes".' : undefined}
              >
                {sports.map((sport) => (
                  <MenuItem key={sport.sportId} value={String(sport.sportId)}>{sport.sportName}</MenuItem>
                ))}
              </TextField>
              <TextField
                label="Capacidad" type="number" value={form.courtCapacity}
                onChange={(event) => setForm((current) => ({ ...current, courtCapacity: event.target.value }))}
                slotProps={{ htmlInput: { min: 1 } }} fullWidth required
              />
              <TextField
                label="Precio" type="number" value={form.courtPrice}
                onChange={(event) => setForm((current) => ({ ...current, courtPrice: event.target.value }))}
                slotProps={{ htmlInput: { min: 0, step: 0.5 } }} fullWidth required
              />
            </Stack>
          </Stack>
          {formError && <Alert severity="error" sx={{ mt: 2 }}>{formError}</Alert>}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeForm} color="inherit" disabled={isSaving}>Cancelar</Button>
          <Button onClick={submitForm} variant="contained" loading={isSaving}>Guardar cancha</Button>
        </DialogActions>
      </Dialog>

      {/* Modal de confirmación de eliminación */}
      <Dialog open={Boolean(courtToDelete)} onClose={() => !isDeleting && setCourtToDelete(null)} fullWidth maxWidth="xs">
        <DialogTitle>Eliminar cancha</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Seguro que deseas eliminar la cancha <strong>{courtToDelete?.courtName}</strong>? Esta acción no se puede deshacer.
          </Typography>
          {deleteError && <Alert severity="error" sx={{ mt: 2 }}>{deleteError}</Alert>}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCourtToDelete(null)} color="inherit" disabled={isDeleting}>Cancelar</Button>
          <Button onClick={confirmDelete} color="error" variant="contained" loading={isDeleting}>Eliminar</Button>
        </DialogActions>
      </Dialog>

      {/* Modal de gestión de deportes */}
      <Dialog open={isSportDialogOpen} onClose={() => setIsSportDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Deportes</DialogTitle>
        <DialogContent>
          <Stack spacing={1} sx={{ mb: 2 }}>
            {sports.length === 0
              ? <Typography variant="body2" color="text.secondary">Aún no hay deportes registrados.</Typography>
              : sports.map((sport) => (
                <Chip key={sport.sportId} label={sport.sportName} sx={{ alignSelf: 'flex-start' }} />
              ))}
          </Stack>
          <Stack direction="row" spacing={1}>
            <TextField
              label="Nuevo deporte" value={newSportName} size="small" fullWidth
              onChange={(event) => setNewSportName(event.target.value)}
            />
            <Button variant="contained" onClick={submitNewSport} loading={isSavingSport}>Agregar</Button>
          </Stack>
          {sportError && <Alert severity="error" sx={{ mt: 2 }}>{sportError}</Alert>}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setIsSportDialogOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
