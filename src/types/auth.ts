export type UserRole = 'normal' | 'administrador';

export type AuthContext = {
  token: string;
  user: { id: string; name: string; email: string; role: UserRole };
};
