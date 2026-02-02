import React from 'react';
import ReactDOM from 'react-dom/client';
import '@/styles/globals.css';

const Popup: React.FC = () => {
    const openSidePanel = () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]?.id) {
                chrome.sidePanel.open({ tabId: tabs[0].id });
                window.close();
            }
        });
    };

    return (
        <div className="w-72 p-4 bg-bg-primary">
            {/* Logo */}
            <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 flex items-center justify-center overflow-hidden rounded-xl">
                    <img src="/icons/icon128.png" alt="PolyPost Logo" className="w-full h-full object-cover" />
                </div>
                <div>
                    <h1 className="text-text-primary font-semibold text-lg">PolyPost</h1>
                    <p className="text-text-muted text-xs">Content Creation Assistant</p>
                </div>
            </div>

            {/* Description */}
            <p className="text-text-secondary text-sm mb-4">
                AI-powered tweet polishing, translation, and multi-variant management.
            </p>

            {/* Open Side Panel Button */}
            <button
                onClick={openSidePanel}
                className="w-full py-2.5 bg-accent hover:bg-accent-hover text-white rounded-lg font-medium text-sm transition-colors"
            >
                Open PolyPost
            </button>

            {/* Quick Stats (placeholder) */}
            <div className="mt-4 pt-4 border-t border-border-primary grid grid-cols-3 gap-2 text-center">
                <div>
                    <p className="text-accent font-semibold text-lg">0</p>
                    <p className="text-text-muted text-xs">Drafts</p>
                </div>
                <div>
                    <p className="text-status-scheduled font-semibold text-lg">0</p>
                    <p className="text-text-muted text-xs">Scheduled</p>
                </div>
                <div>
                    <p className="text-status-posted font-semibold text-lg">0</p>
                    <p className="text-text-muted text-xs">Posted</p>
                </div>
            </div>
        </div>
    );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <Popup />
    </React.StrictMode>
);
