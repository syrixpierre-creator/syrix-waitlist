import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import AdminApp from './components/AdminApp';
import './styles.css';

const isAdmin = /^\/syrixadmin\/?$/.test(location.pathname);

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>{isAdmin ? <AdminApp /> : <App />}</React.StrictMode>,
);
