import { createRoot } from 'react-dom/client';
import { useState, lazy, Suspense } from 'react';
import { usada } from './util.js';
import Relatorio from './Relatorio.jsx';
function App() { const [ver, setVer] = useState(false); return <div><p>{usada(2)}</p><button onClick={() => setVer(true)}>Relatório</button>{ver && <Relatorio />}</div>; }
createRoot(document.getElementById('root')).render(<App />);
