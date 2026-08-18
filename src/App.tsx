import './App.css';
import { mockAuth } from './data/mockAuth';
import type { AuthContext } from './types/auth';

type AppProps = { auth?: AuthContext };

const App = ({ auth = mockAuth }: AppProps) => {
  return (
  <div>
      <h1>Microfrontend de Administración</h1>

      <p>
        Este componente pertenece al módulo remoto Administración.
      </p>

      <p>Usuario actual: {auth.user.name}</p>

    </div>
  );
};

export default App;
