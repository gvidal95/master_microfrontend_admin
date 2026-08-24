import './App.css';
import { useState } from 'react';
import { mockAuth } from './data/mockAuth';
import type { AuthContext } from './types/auth';
import { Alert, Box, Paper, Tab, Tabs, Typography } from '@mui/material';
import { CourtManagement } from './components/CourtManagement';
import { CourtShedule } from './components/CourtShedule';
import type { CourtData } from './types/court';
import { ServicesProvider } from './services/ServicesContext';
import { ReservationManagement } from './components/ReservationManagement';

type AppProps = { auth?: AuthContext };

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
}

const App = ({ auth }: AppProps) => {
  const [activeTab, setActiveTab] = useState(0);
  const isStandalone = auth === undefined;
  const currentAuth = auth ?? mockAuth;
  const parsedUserId = Number(currentAuth.user.id);
  const hasValidUserId = Number.isSafeInteger(parsedUserId) && parsedUserId > 0;

  const [courtSelected, setCourtSelected] = useState<CourtData | null>(null);

  return (
    <ServicesProvider token={currentAuth.token}>
      <Paper data-auth-mode={isStandalone ? 'standalone' : 'shell'} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ px: 2, pt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Sesión activa: {currentAuth.user.name} ({currentAuth.user.email})
          </Typography>
        </Box>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          aria-label="Gestión de administración"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Gestión de Canchas" id="tab-0" aria-controls="tabpanel-0" />
          <Tab label="Gestión de Reservas" id="tab-1" aria-controls="tabpanel-1" />
        </Tabs>

        <Box sx={{ flex: 1, overflow: 'auto' }}>
          <TabPanel value={activeTab} index={0}>
            <CourtManagement
              selectedCourtId={courtSelected?.courtId ?? null}
              onManageSchedule={(court) => setCourtSelected(court)}
              syncedCourt={courtSelected}
            />

            {
              courtSelected &&
              <CourtShedule
                court={courtSelected}
                onScheduleChange={(schedules) => setCourtSelected((current) => (
                  current ? { ...current, courtSchedules: schedules } : current
                ))}
              />
            }

          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            {/* TODO: Sección 2: Crear mantenimiento de reservas, solo tabla de reservas con botón de cancelación. Considerar un select para mostrar reservas canceladas y activas */}
            {hasValidUserId ? (
              <ReservationManagement userId={parsedUserId} />
            ) : (
              <Alert severity="error" sx={{ maxWidth: 1180, mx: 'auto', mt: 3 }}>
                Error al cargar las reservas
              </Alert>
            )}
          </TabPanel>
        </Box>
      </Paper>
    </ServicesProvider>
  );
};

export default App;
