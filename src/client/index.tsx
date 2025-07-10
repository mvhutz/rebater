import App from './App';
import './index.css';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { Store } from './store';

/** ------------------------------------------------------------------------- */

ReactDOM.createRoot(document.body).render(
  <Provider store={Store}>
    <App/>
  </Provider>
);
