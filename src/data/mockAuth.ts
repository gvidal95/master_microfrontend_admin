import type { AuthContext } from '../types/auth';

export const mockAuth: AuthContext = {
  token: 'mock-jwt.administracion.local',
  user: { id: 'administracion-local-user', name: 'Administrador de prueba', email: 'admin@demo.com', role: 'administrador' },
};
