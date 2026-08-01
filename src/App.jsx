// import React from 'react';
// import ClassicGame from './components/clashroyale/ClassicGame.jsx';
// import './App.css';
//
// function App() {
//     return (
//         <div className="App">
//             <ClassicGame />
//         </div>
//     );
// }
//
// export default App;

// src/App.jsx
import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import SiteHeader from './components/layout/SiteHeader.jsx';
import SiteFooter from './components/layout/SiteFooter.jsx';

const ClassicGame = lazy(() => import('./components/clashroyale/ClassicGame.jsx'));
const DescriptionGame   = lazy(() => import('./components/clashroyale/DescriptionGame'));
const RushGame   = lazy(() => import('./components/clashroyale/RushGame.jsx'));
const MemoryGame    = lazy(() => import('./components/clashroyale/MemoryGame.jsx'));

const AboutPage   = lazy(() => import('./pages/AboutPage.jsx'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage.jsx'));
const ContactPage = lazy(() => import('./pages/ContactPage.jsx'));
const TermsPage   = lazy(() => import('./pages/TermsPage.jsx'));

export default function App() {
    return (
        <>
            <SiteHeader />

            <Suspense fallback={<div />}>
                <Routes>
                    <Route path="/" element={<ClassicGame />} />
                    <Route path="/clashroyale/description" element={<DescriptionGame />} />
                    <Route path="/clashroyale/rush" element={<RushGame />} />
                    <Route path="/clashroyale/memory" element={<MemoryGame />} />

                    <Route path="/about"   element={<AboutPage />} />
                    <Route path="/privacy" element={<PrivacyPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/terms"   element={<TermsPage />} />

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Suspense>
            
            <SiteFooter />
        </>
    );
}
