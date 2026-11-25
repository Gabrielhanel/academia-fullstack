import { cookies } from 'next/headers';
export default async function Painel() { const c = await cookies(); return <p>dinâmico {c.get('x')?.value ?? 'sem cookie'} {Date.now()}</p>; }
