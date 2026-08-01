import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import { migrateClashleToClashdle } from './utils/clashroyale/migrateStorage.js';

if (typeof window !== 'undefined') {
    migrateClashleToClashdle();

    const rootEl = document.getElementById('root');
    const app = (
        <React.StrictMode>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </React.StrictMode>
    );

    // Prerendered pages ship with HTML inside #root → hydrate it.
    // Dev server ships an empty #root → render from scratch.
    if (rootEl.hasChildNodes()) {
        ReactDOM.hydrateRoot(rootEl, app);
    } else {
        ReactDOM.createRoot(rootEl).render(app);
    }
}