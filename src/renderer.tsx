import { HashRouter } from 'react-router';
import App from './app/App';
import SettingsProvider from './app/context/SettingsProvider';
import './index.css';
import ReactDOM from 'react-dom/client';
import ProcessorProvider from './app/context/ProcessorProvider';

/** ------------------------------------------------------------------------- */

ReactDOM.createRoot(document.body).render(
  <SettingsProvider>
    <ProcessorProvider>
      <HashRouter>
        <App/>
      </HashRouter>
    </ProcessorProvider>
  </SettingsProvider>
);
