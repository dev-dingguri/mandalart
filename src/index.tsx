import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { IconContext } from 'react-icons/lib';
import { ThemeProvider } from 'contexts/ThemeContext';
import { AlertProvider } from 'contexts/AlertContext';
import { HelmetProvider } from 'react-helmet-async';
import { FirebaseSdksProvider } from 'contexts/FirebaseSdksContext';
import 'locales/i18n';
import { LoadingProvider } from 'contexts/LoadingContext';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <HelmetProvider>
      <IconContext.Provider value={{ className: 'react-icons' }}>
        <FirebaseSdksProvider firebaseConfig={firebaseConfig}>
          <LoadingProvider>
            <ThemeProvider>
              <AlertProvider>
                <App />
              </AlertProvider>
            </ThemeProvider>
          </LoadingProvider>
        </FirebaseSdksProvider>
      </IconContext.Provider>
    </HelmetProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
