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
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

const ClassicGame = lazy(() => import('./components/clashroyale/ClassicGame.jsx'));
const DescriptionGame   = lazy(() => import('./components/clashroyale/DescriptionGame'));
const RushGame   = lazy(() => import('./components/clashroyale/RushGame.jsx'));
const MemoryGame    = lazy(() => import('./components/clashroyale/MemoryGame.jsx'));

export default function App() {
    return (
        <BrowserRouter>
            <Suspense fallback={<div />}>
                <Routes>
                    <Route path="/" element={<ClassicGame />} />
                    <Route path="/clashroyale/description" element={<DescriptionGame />} />
                    <Route path="/clashroyale/rush" element={<RushGame />} />
                    <Route path="/clashroyale/memory" element={<MemoryGame />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Suspense>
        </BrowserRouter>
    );
}
