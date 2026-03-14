import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { IconContext } from 'react-icons/lib';

import 'locales/i18n';
import 'stores/useAuthStore';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <IconContext.Provider value={{ className: 'react-icons' }}>
      <App />
    </IconContext.Provider>
  </React.StrictMode>
);
