import React from 'react';
import ReactDOM from 'react-dom/client';
import { themeManager } from './theme/theme-manager';
import { App } from './App';
import './styles/global.css';

themeManager.init();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
