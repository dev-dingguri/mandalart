import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { IconContext } from 'react-icons/lib';

import { FirebaseSdksProvider } from 'contexts/FirebaseSdksContext';
import 'locales/i18n';
import { LoadingProvider } from 'contexts/LoadingContext';
import { FirebaseOptions } from 'firebase/app';

const firebaseConfig: FirebaseOptions = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <IconContext.Provider value={{ className: 'react-icons' }}>
      <FirebaseSdksProvider firebaseConfig={firebaseConfig}>
        <LoadingProvider>
          <App />
        </LoadingProvider>
      </FirebaseSdksProvider>
    </IconContext.Provider>
  </React.StrictMode>
);
