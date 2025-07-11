import App from './App';
import './index.css';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { Store } from './store';
import { HashRouter } from 'react-router';

/** ------------------------------------------------------------------------- */

ReactDOM.createRoot(document.body).render(
  <HashRouter>
    <Provider store={Store}>
      <App/>
    </Provider>
  </HashRouter>
);
