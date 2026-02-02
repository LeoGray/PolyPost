import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import '@/styles/globals.css';
import { seedMockData } from '@/utils/mockData';

// Expose mock data seeder to window for automation
(window as any).seedMockData = seedMockData;

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
