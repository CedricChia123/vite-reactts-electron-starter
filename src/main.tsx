import React from 'react';
import './index.css';
import App from './App';
import { createRoot } from 'react-dom/client';
import { NotificationProvider } from './context/NotificationContext';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();
const container = document.getElementById('root');
const root = createRoot(container!)

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <NotificationProvider>
        <App />
      </NotificationProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
