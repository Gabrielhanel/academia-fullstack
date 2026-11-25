import { useState, useCallback, createContext, useContext } from 'react';
export const Tema = createContext('claro');
export function useContagem(inicial = 0) { const [n, setN] = useState(inicial); const inc = useCallback(() => setN((x) => x + 1), []); const tema = useContext(Tema); return { n, inc, tema }; }
