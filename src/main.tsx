import React from 'react';
import ReactDOM from 'react-dom/client';
import { PredictorDashboard } from './components/PredictorDashboard';
import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PredictorDashboard />
  </React.StrictMode>
);
