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

export default function App() {
    return (
        <BrowserRouter>
            <Suspense fallback={<div />}>
                <Routes>
                    <Route path="/" element={<ClassicGame />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Suspense>
        </BrowserRouter>
    );
}
