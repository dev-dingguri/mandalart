import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { IconContext } from 'react-icons/lib';
import { ThemeProvider } from 'contexts/ThemeContext';
import { AlertProvider } from 'contexts/AlertContext';
import { HelmetProvider } from 'react-helmet-async';
import 'locales/i18n';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <HelmetProvider>
      <IconContext.Provider value={{ className: 'react-icons' }}>
        <ThemeProvider>
          <AlertProvider>
            <App />
          </AlertProvider>
        </ThemeProvider>
      </IconContext.Provider>
    </HelmetProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
