import { useEffect, useState } from 'react';
export function Relogio() { const [s, setS] = useState(0); useEffect(() => { const id = setInterval(() => setS((x) => x + 1), 1000); return () => clearInterval(id); }, []); return <p>{s}s</p>; }
