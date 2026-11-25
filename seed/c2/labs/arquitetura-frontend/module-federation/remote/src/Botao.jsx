import { useState } from 'react';
export default function Botao() { const [n, setN] = useState(0); return <button onClick={() => setN(n + 1)}>remoto {n}</button>; }
