export const formatTime = (time: string) => time.slice(0, 5);

export const formatDate = (date: string) => new Intl.DateTimeFormat('es-EC', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  timeZone: 'UTC',
}).format(new Date(`${date}T00:00:00Z`));