import type { CourtData } from "../types/court";

export const courtDataExample: CourtData = {
  courtId: 1,
  courtName: 'Cancha Sintética 1',
  courtDescription: 'Cancha de fútbol 5 con césped sintético e iluminación.',
  courtCapacity: 10,
  courtSportId: 1,
  courtPrice: 25,
  courtSport: {
    sportId: 1,
    sportName: 'Fútbol',
  },
  courtSchedules: [
    {
      scheduleId: 1,
      scheduleDay: 'Lunes',
      scheduleCourtId: 1,
      scheduleStart: '08:00:00',
      scheduleEnd: '22:00:00',
    },
    {
      scheduleId: 2,
      scheduleDay: 'Miércoles',
      scheduleCourtId: 1,
      scheduleStart: '08:00:00',
      scheduleEnd: '22:00:00',
    },
  ],
};