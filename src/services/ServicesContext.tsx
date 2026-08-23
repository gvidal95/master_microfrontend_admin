import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { createCourtService, type CourtService } from './courtService';
import { createSportService, type SportService } from './sportService';

type Services = {
  courtService: CourtService;
  sportService: SportService;
};

const ServicesContext = createContext<Services | null>(null);

type ServicesProviderProps = {
  token: string;
  children: ReactNode;
};

export const ServicesProvider = ({ token, children }: ServicesProviderProps) => {
  const services = useMemo<Services>(() => ({
    courtService: createCourtService(token),
    sportService: createSportService(token),
  }), [token]);

  return <ServicesContext.Provider value={services}>{children}</ServicesContext.Provider>;
};

export const useServices = (): Services => {
  const services = useContext(ServicesContext);
  if (!services) throw new Error('useServices debe utilizarse dentro de ServicesProvider.');
  return services;
};
