import AddRoundedIcon from '@mui/icons-material/AddRounded';
import BuildRoundedIcon from '@mui/icons-material/BuildRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import SportsRoundedIcon from '@mui/icons-material/SportsRounded';
import ToggleOffRoundedIcon from '@mui/icons-material/ToggleOffRounded';
import ToggleOnRoundedIcon from '@mui/icons-material/ToggleOnRounded';
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
import type { MaintenanceBlockData, MaintenanceBlockSaveData } from '../types/maintenanceBlock';
import type { SportData } from '../types/sport';
import { formatDate } from '../utils/DateTime';

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

  const [togglingCourtId, setTogglingCourtId] = useState<number | null>(null);
  const [toggleError, setToggleError] = useState('');

  const [courtForMaintenance, setCourtForMaintenance] = useState<CourtData | null>(null);
  const [maintenanceForm, setMaintenanceForm] = useState({ startDate: '', endDate: '', reason: '' });
  const [maintenanceFormError, setMaintenanceFormError] = useState('');
  const [isSavingMaintenance, setIsSavingMaintenance] = useState(false);
  const [blockToDelete, setBlockToDelete] = useState<MaintenanceBlockData | null>(null);
  const [isDeletingBlock, setIsDeletingBlock] = useState(false);
  const [deleteBlockError, setDeleteBlockError] = useState('');

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

  const toggleActive = async (court: CourtData) => {
    setTogglingCourtId(court.courtId);
    setToggleError('');
    try {
      const updatedCourt = await courtService.updateCourtActive(court.courtId, !court.courtActive);
      setCourts((current) => current.map((item) => (item.courtId === updatedCourt.courtId ? updatedCourt : item)));
    } catch {
      setToggleError('No se pudo actualizar el estado de la cancha. Inténtalo nuevamente.');
    } finally {
      setTogglingCourtId(null);
    }
  };

  const updateCourtMaintenanceBlocks = (
    courtId: number,
    updater: (blocks: MaintenanceBlockData[]) => MaintenanceBlockData[],
  ) => {
    setCourts((current) => current.map((court) => (
      court.courtId === courtId
        ? { ...court, courtMaintenanceBlocks: updater(court.courtMaintenanceBlocks ?? []) }
        : court
    )));
    setCourtForMaintenance((current) => (
      current && current.courtId === courtId
        ? { ...current, courtMaintenanceBlocks: updater(current.courtMaintenanceBlocks ?? []) }
        : current
    ));
  };

  const openMaintenanceDialog = (court: CourtData) => {
    setCourtForMaintenance(court);
    setMaintenanceForm({ startDate: '', endDate: '', reason: '' });
    setMaintenanceFormError('');
  };

  const closeMaintenanceDialog = () => {
    if (isSavingMaintenance) return;
    setCourtForMaintenance(null);
  };

  const submitMaintenanceBlock = async () => {
    if (!courtForMaintenance) return;

    if (!maintenanceForm.startDate || !maintenanceForm.endDate) {
      setMaintenanceFormError('Selecciona la fecha de inicio y de fin del bloqueo.');
      return;
    }
    if (maintenanceForm.endDate < maintenanceForm.startDate) {
      setMaintenanceFormError('La fecha de fin debe ser igual o posterior a la fecha de inicio.');
      return;
    }

    const payload: MaintenanceBlockSaveData = {
      maintenanceBlockCourtId: courtForMaintenance.courtId,
      maintenanceBlockStartDate: maintenanceForm.startDate,
      maintenanceBlockEndDate: maintenanceForm.endDate,
      maintenanceBlockReason: maintenanceForm.reason.trim(),
    };

    setIsSavingMaintenance(true);
    setMaintenanceFormError('');
    try {
      const savedBlock = await courtService.createMaintenanceBlock(payload);
      updateCourtMaintenanceBlocks(courtForMaintenance.courtId, (blocks) => [...blocks, savedBlock]);
      setMaintenanceForm({ startDate: '', endDate: '', reason: '' });
    } catch {
      setMaintenanceFormError('No se pudo crear el bloqueo de mantenimiento. Inténtalo nuevamente.');
    } finally {
      setIsSavingMaintenance(false);
    }
  };

  const confirmDeleteBlock = async () => {
    if (!blockToDelete || !courtForMaintenance) return;
    setIsDeletingBlock(true);
    setDeleteBlockError('');
    try {
      await courtService.deleteMaintenanceBlock(blockToDelete.maintenanceBlockId);
      updateCourtMaintenanceBlocks(courtForMaintenance.courtId, (blocks) => (
        blocks.filter((block) => block.maintenanceBlockId !== blockToDelete.maintenanceBlockId)
      ));
      setBlockToDelete(null);
    } catch {
      setDeleteBlockError('No se pudo eliminar el bloqueo. Inténtalo nuevamente.');
    } finally {
      setIsDeletingBlock(false);
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
      {toggleError && <Alert severity="error" sx={{ mb: 2 }}>{toggleError}</Alert>}

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
                <TableCell align="center">Estado</TableCell>
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
                  <TableCell align="center">
                    <Chip
                      label={court.courtActive ? 'Activa' : 'Inactiva'}
                      color={court.courtActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Gestionar horarios">
                      <IconButton color={court.courtId === selectedCourtId ? 'primary' : 'default'} onClick={() => onManageSchedule(court)}>
                        <ScheduleRoundedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Bloqueos de mantenimiento">
                      <IconButton color={court.courtId === courtForMaintenance?.courtId ? 'primary' : 'default'} onClick={() => openMaintenanceDialog(court)}>
                        <BuildRoundedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={court.courtActive ? 'Inactivar cancha' : 'Activar cancha'}>
                      <span>
                        <IconButton
                          color={court.courtActive ? 'success' : 'default'}
                          disabled={togglingCourtId !== null}
                          onClick={() => toggleActive(court)}
                        >
                          {togglingCourtId === court.courtId
                            ? <CircularProgress size={20} color="inherit" />
                            : court.courtActive ? <ToggleOnRoundedIcon fontSize="small" /> : <ToggleOffRoundedIcon fontSize="small" />}
                        </IconButton>
                      </span>
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

      {/* Modal de bloqueos de mantenimiento */}
      <Dialog open={Boolean(courtForMaintenance)} onClose={closeMaintenanceDialog} fullWidth maxWidth="sm">
        <DialogTitle>Bloqueos de mantenimiento · {courtForMaintenance?.courtName}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Mientras una cancha tenga un bloqueo vigente para una fecha, no aparecerá como disponible para reservar ese día.
          </Typography>

          <Stack spacing={1} sx={{ mb: 2.5 }}>
            {(courtForMaintenance?.courtMaintenanceBlocks ?? []).length === 0 ? (
              <Typography variant="body2" color="text.secondary">Sin bloqueos registrados.</Typography>
            ) : (
              (courtForMaintenance?.courtMaintenanceBlocks ?? [])
                .slice()
                .sort((a, b) => a.maintenanceBlockStartDate.localeCompare(b.maintenanceBlockStartDate))
                .map((block) => (
                  <Paper key={block.maintenanceBlockId} variant="outlined" sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {formatDate(block.maintenanceBlockStartDate)} — {formatDate(block.maintenanceBlockEndDate)}
                      </Typography>
                      {block.maintenanceBlockReason && (
                        <Typography variant="caption" color="text.secondary">{block.maintenanceBlockReason}</Typography>
                      )}
                    </Box>
                    <Tooltip title="Eliminar bloqueo">
                      <span>
                        <IconButton
                          color="error"
                          size="small"
                          disabled={isDeletingBlock}
                          onClick={() => { setBlockToDelete(block); setDeleteBlockError(''); }}
                        >
                          <DeleteOutlineRoundedIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Paper>
                ))
            )}
          </Stack>

          <Typography variant="subtitle2" sx={{ mb: 1.5 }}>Nuevo bloqueo</Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Fecha de inicio" type="date" value={maintenanceForm.startDate}
              onChange={(event) => setMaintenanceForm((current) => ({ ...current, startDate: event.target.value }))}
              slotProps={{ inputLabel: { shrink: true } }} fullWidth required
            />
            <TextField
              label="Fecha de fin" type="date" value={maintenanceForm.endDate}
              onChange={(event) => setMaintenanceForm((current) => ({ ...current, endDate: event.target.value }))}
              slotProps={{ inputLabel: { shrink: true } }} fullWidth required
            />
          </Stack>
          <TextField
            label="Motivo" value={maintenanceForm.reason} sx={{ mt: 2 }}
            onChange={(event) => setMaintenanceForm((current) => ({ ...current, reason: event.target.value }))}
            fullWidth multiline minRows={2} placeholder="Ej. Cambio de red, resurfacing…"
          />
          {maintenanceFormError && <Alert severity="error" sx={{ mt: 2 }}>{maintenanceFormError}</Alert>}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeMaintenanceDialog} color="inherit" disabled={isSavingMaintenance}>Cerrar</Button>
          <Button onClick={submitMaintenanceBlock} variant="contained" loading={isSavingMaintenance}>Agregar bloqueo</Button>
        </DialogActions>
      </Dialog>

      {/* Modal de confirmación de eliminación de bloqueo */}
      <Dialog open={Boolean(blockToDelete)} onClose={() => !isDeletingBlock && setBlockToDelete(null)} fullWidth maxWidth="xs">
        <DialogTitle>Eliminar bloqueo</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Seguro que deseas eliminar el bloqueo del{' '}
            <strong>{blockToDelete && formatDate(blockToDelete.maintenanceBlockStartDate)}</strong> al{' '}
            <strong>{blockToDelete && formatDate(blockToDelete.maintenanceBlockEndDate)}</strong>?
          </Typography>
          {deleteBlockError && <Alert severity="error" sx={{ mt: 2 }}>{deleteBlockError}</Alert>}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setBlockToDelete(null)} color="inherit" disabled={isDeletingBlock}>Cancelar</Button>
          <Button onClick={confirmDeleteBlock} color="error" variant="contained" loading={isDeletingBlock}>Eliminar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
