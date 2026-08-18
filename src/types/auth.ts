export type UserRole = 'normal' | 'administrador';

// Contrato recibido desde el shell. Debe mantenerse idéntico en cada MFE.
export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export type AuthContext = {
  token: string;
  user: AuthUser;
};
