import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import '@/styles/globals.css';
import { seedMockData } from '@/utils/mockData';

// Expose mock data seeder to window for automation
(window as any).seedMockData = seedMockData;

const AppRoot: React.FC = () => {
    useEffect(() => {
        if (window.top === window) {
            return;
        }

        window.parent.postMessage({ type: 'polypost:embed-ready' }, '*');
    }, []);

    return <App />;
};

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <AppRoot />
    </React.StrictMode>,
);
