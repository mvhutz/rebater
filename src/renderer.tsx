import { HashRouter } from 'react-router';
import App from './app/App';
import './index.css';
import ReactDOM from 'react-dom/client';

/** ------------------------------------------------------------------------- */

ReactDOM.createRoot(document.body).render(
  <HashRouter>
    <App/>
  </HashRouter>
);
