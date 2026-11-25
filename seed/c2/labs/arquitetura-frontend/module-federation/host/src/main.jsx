import { createRoot } from 'react-dom/client'; import { lazy, Suspense } from 'react';
const Botao = lazy(() => import('remoto/Botao'));
createRoot(document.getElementById('root')).render(<Suspense fallback="carregando remoto..."><Botao /></Suspense>);
