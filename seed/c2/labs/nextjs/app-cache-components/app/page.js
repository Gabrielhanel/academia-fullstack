import { Suspense } from 'react';
import { getPosts } from '../lib';
async function Posts() { const p = await getPosts(); return <ul>{p.map((x) => <li key={x}>{x}</li>)}</ul>; }
async function Agora() { await new Promise((r) => setTimeout(r, 1500)); return <p>agora {Date.now() > 0 ? 'ok' : ''}</p>; }
export default function Home() { return <><h1>Shell</h1><Posts /><Suspense fallback={<p>carregando agora...</p>}><Agora /></Suspense></>; }
