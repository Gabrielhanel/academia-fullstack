import { useState } from 'react';
export function Contador({ inicial = 0 }) { const [n, setN] = useState(inicial); return <div><p>Contagem: {n}</p><button onClick={() => setN(n + 1)}>Incrementar</button></div>; }
