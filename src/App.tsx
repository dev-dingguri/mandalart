import React from 'react';
import styles from './App.module.css';
import Mandalart from './components/mandalart/Mandalart';

const App = () => {
  return (
    <div className={styles.app}>
      <Mandalart />
    </div>
  );
};

export default App;
