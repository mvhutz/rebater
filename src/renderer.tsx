import { HashRouter } from 'react-router';
import App from './app/App';
import SettingsProvider from './app/context/SettingsProvider';
import './index.css';
import ReactDOM from 'react-dom/client';

/** ------------------------------------------------------------------------- */

ReactDOM.createRoot(document.body).render(
  <SettingsProvider>
    <HashRouter>
      <App/>
    </HashRouter>
  </SettingsProvider>
);
