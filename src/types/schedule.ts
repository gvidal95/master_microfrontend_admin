export type ScheduleData = {
    scheduleId: number;
    scheduleDay: string;
    scheduleCourtId: number;
    scheduleStart: string;
    scheduleEnd: string;
};

export type ScheduleSaveData = {
    scheduleDay: string;
    scheduleCourtId: number;
    scheduleStart: string;
    scheduleEnd: string;
};

export const scheduleDataExample: ScheduleData = {
    "scheduleId": 1,
    "scheduleDay": "Lunes",
    "scheduleCourtId": 1,
    "scheduleStart": "12:00:00",
    "scheduleEnd": "20:00:00"
};

export const scheduleSaveDataExample: ScheduleSaveData = {
    "scheduleDay": "Lunes",
    "scheduleCourtId": 1,
    "scheduleStart": "12:00",
    "scheduleEnd": "20:00"
};

export const weekDays = [
    'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo',
];
