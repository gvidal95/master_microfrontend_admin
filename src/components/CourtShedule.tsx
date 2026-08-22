import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import { Alert, Box, Button, Card, CardContent, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid, IconButton, Stack, TextField, Tooltip, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { type ScheduleData, type ScheduleSaveData, weekDays } from '../types/schedule';
import type { CourtData } from '../types/court';
import { courtService } from '../services/courtService';

type CourtSheduleProps = {
    court: CourtData;
    onScheduleChange?: (schedules: ScheduleData[]) => void;
};


type TimeRange = { start: string; end: string };

const apiDayByDisplayDay: Record<string, string> = {
    Lunes: 'MONDAY',
    Martes: 'TUESDAY',
    Miércoles: 'WEDNESDAY',
    Jueves: 'THURSDAY',
    Viernes: 'FRIDAY',
    Sábado: 'SATURDAY',
    Domingo: 'SUNDAY',
};

const displayDayByApiDay = Object.fromEntries(
    Object.entries(apiDayByDisplayDay).map(([displayDay, apiDay]) => [apiDay, displayDay]),
);

const toDisplayDay = (day: string) => displayDayByApiDay[day.toUpperCase()] ?? day;

const toInputTime = (time: string) => time.slice(0, 5);
const toStoredTime = (time: string) => `${time}:00`;
const timeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
};
const formatTime = (minutes: number) => `${Math.floor(minutes / 60).toString().padStart(2, '0')}:${(minutes % 60).toString().padStart(2, '0')}`;

const getHourBlocks = (schedule: ScheduleData) => {
    const blocks: string[] = [];
    const start = timeToMinutes(schedule.scheduleStart);
    const end = timeToMinutes(schedule.scheduleEnd);
    for (let slotStart = start; slotStart + 60 <= end; slotStart += 60)
        blocks.push(`${formatTime(slotStart)} – ${formatTime(slotStart + 60)}`);
    return blocks;
};

export const CourtShedule = ({ court, onScheduleChange }: CourtSheduleProps) => {

    const [schedules, setSchedules] = useState<ScheduleData[]>(court.courtSchedules ?? []);
    const [dayToEdit, setDayToEdit] = useState<string | null>(null);
    const [timeRange, setTimeRange] = useState<TimeRange>({ start: '08:00', end: '22:00' });
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const schedulesByDay = useMemo(
        () => new Map(schedules.map((schedule) => [toDisplayDay(schedule.scheduleDay), schedule])),
        [schedules],
    );

    useEffect(() => {
        setSchedules(court.courtSchedules ?? []);
        setDayToEdit(null);
        setError('');
    }, [court]);

    const openEditor = (day: string) => {
        const current = schedulesByDay.get(day);
        setDayToEdit(day);
        setTimeRange({ start: current ? toInputTime(current.scheduleStart) : '08:00', end: current ? toInputTime(current.scheduleEnd) : '22:00' });
        setError('');
    };
    const closeEditor = () => {
        if (isSaving) return;
        setDayToEdit(null);
        setError('');
    };

    const saveSchedule = async () => {
        if (!dayToEdit) return;

        if (timeToMinutes(timeRange.end) - timeToMinutes(timeRange.start) < 60) {
            setError('La hora de fin debe ser al menos 60 minutos posterior a la hora de inicio.');
            return;
        }
        const existing = schedulesByDay.get(dayToEdit);

        const schedule: ScheduleSaveData = {
            scheduleDay: apiDayByDisplayDay[dayToEdit],
            scheduleCourtId: court.courtId,
            scheduleStart: toStoredTime(timeRange.start),
            scheduleEnd: toStoredTime(timeRange.end),
        };

        setIsSaving(true);
        setError('');

        try {
            const savedSchedule = existing
                ? await courtService.updateSchedule(existing.scheduleId, schedule)
                : await courtService.saveSchedule(schedule);

            const nextSchedules = existing
                ? schedules.map((current) => current.scheduleId === existing.scheduleId ? savedSchedule : current)
                : [...schedules, savedSchedule];

            setSchedules(nextSchedules);
            onScheduleChange?.(nextSchedules);
            setDayToEdit(null);
        } catch {
            setError(existing
                ? 'No se pudo actualizar el horario. Inténtalo nuevamente.'
                : 'No se pudo crear el horario. Inténtalo nuevamente.');
        } finally {
            setIsSaving(false);
        }
    };

    const editingSchedule = dayToEdit ? schedulesByDay.get(dayToEdit) : undefined;

    return (
        <Box sx={{ maxWidth: 1180, mx: 'auto', py: 2 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3, justifyContent: 'space-between', alignItems: { sm: 'center' } }}>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>Horarios de la cancha</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Define la disponibilidad semanal. Los intervalos se generan en bloques de 60 minutos.</Typography>
                </Box>
                <Chip icon={<CalendarMonthRoundedIcon />} label={`${schedules.length} de 7 días configurados`} color="primary" variant="outlined" />
            </Stack>
            <Grid container spacing={2}>
                {weekDays.map((day) => {

                    const schedule = schedulesByDay.get(day);
                    const blocks = schedule ? getHourBlocks(schedule) : [];

                    return <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={day}>
                        <Card variant="outlined" sx={{ height: '100%', borderColor: schedule ? 'primary.light' : 'divider' }}>
                            <CardContent sx={{ p: 2.25, '&:last-child': { pb: 2.25 } }}>
                                <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="h6" sx={{ fontWeight: 700 }}>{day}</Typography>
                                    {schedule ?
                                        <Tooltip title={`Editar horario de ${day}`}>
                                            <IconButton color="primary" onClick={() => openEditor(day)} aria-label={`Editar horario de ${day}`}>
                                                <EditOutlinedIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip> :
                                        <Button size="small" startIcon={<AddRoundedIcon />} onClick={() => openEditor(day)}>Crear</Button>}
                                </Stack>
                                <Divider sx={{ my: 1.5 }} />
                                {schedule ? <>
                                    <Stack direction="row" spacing={1} sx={{ mb: 1.75, alignItems: 'center' }}><ScheduleRoundedIcon color="action" fontSize="small" /><Typography variant="body2" sx={{ fontWeight: 600 }}>{toInputTime(schedule.scheduleStart)} — {toInputTime(schedule.scheduleEnd)}</Typography></Stack>
                                    <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>Vista previa · {blocks.length} bloques</Typography>
                                    <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75 }}>{blocks.map((block) => <Chip key={block} label={block} size="small" color="primary" variant="outlined" />)}</Stack>
                                </> :
                                    <Box sx={{ py: 1.5 }}>
                                        <Typography variant="body2" color="text.secondary">Sin horario configurado.</Typography>
                                    </Box>}
                            </CardContent>
                        </Card>
                    </Grid>;
                })}
            </Grid>

            {/* Modal de creación de horario  */}
            <Dialog open={Boolean(dayToEdit)} onClose={closeEditor} fullWidth maxWidth="xs">
                <DialogTitle>
                    {editingSchedule ? 'Editar horario' : 'Crear horario'} · {dayToEdit}
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>Los bloques de 60 minutos se actualizarán automáticamente en la vista previa.</Typography>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <TextField
                            label="Hora de inicio" type="time" value={timeRange.start}
                            onChange={(event) => setTimeRange((range) => ({ ...range, start: event.target.value }))}
                            slotProps={{ inputLabel: { shrink: true }, htmlInput: { step: 3600 } }} fullWidth required />
                        <TextField label="Hora de fin" type="time"
                            value={timeRange.end}
                            onChange={(event) => setTimeRange((range) => ({ ...range, end: event.target.value }))}
                            slotProps={{ inputLabel: { shrink: true }, htmlInput: { step: 3600 } }} fullWidth required
                        />
                    </Stack>
                    {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={closeEditor} color="inherit" disabled={isSaving}>Cancelar</Button>
                    <Button onClick={saveSchedule} variant="contained" loading={isSaving}>Guardar horario</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};
