import axios from 'axios';
import type { SportData } from '../types/sport';

const sportApi = axios.create({
  baseURL: 'http://localhost:8081/courts/api',
});

/** Servicio HTTP para las operaciones relacionadas con deportes. */
export const sportService = {
  /** Obtiene el catálogo de deportes. */
  getSports: async (): Promise<SportData[]> => {
    const { data } = await sportApi.get<SportData[]>('/sports');
    return data;
  },

  /** Crea un deporte. */
  createSport: async (sportName: string): Promise<SportData> => {
    const { data } = await sportApi.post<SportData>('/sports', { sportName });
    return data;
  },

  /** Elimina un deporte. */
  deleteSport: async (sportId: number): Promise<void> => {
    await sportApi.delete(`/sports/${sportId}`);
  },
};
