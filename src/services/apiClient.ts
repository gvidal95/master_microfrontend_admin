import axios from 'axios';

/** Crea un cliente HTTP que autentica todas sus solicitudes con el JWT de la sesión. */
export const createApiClient = (baseURL: string, token: string) => axios.create({
  baseURL,
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
