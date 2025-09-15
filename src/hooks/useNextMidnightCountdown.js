import { useEffect, useState } from 'react';

const msToHMS = (ms) => {
    const s = Math.max(0, Math.floor(ms / 1000));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const ss = s % 60;
    const pad = (n) => String(n).padStart(2, '0');
    return { h: pad(h), m: pad(m), s: pad(ss) };
};

export default function useNextMidnightCountdown() {
    const calc = () => {
        const now = new Date();
        const next = new Date(now);
        next.setHours(24, 0, 0, 0); // next local midnight
        return next - now;
    };
    const [msLeft, setMsLeft] = useState(calc());
    useEffect(() => {
        const id = setInterval(() => setMsLeft(calc()), 1000);
        return () => clearInterval(id);
    }, []);
    return msToHMS(msLeft);
}
