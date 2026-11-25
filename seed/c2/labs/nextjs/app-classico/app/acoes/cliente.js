'use client';
import { useState } from 'react';
export function Cliente({ dado }) { const [n, setN] = useState(0); return <button onClick={() => setN(n + 1)}>{n} {dado.a}</button>; }
