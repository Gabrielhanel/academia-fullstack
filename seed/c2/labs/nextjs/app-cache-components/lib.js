import { cacheLife, cacheTag } from 'next/cache';
globalThis.__chamadas = globalThis.__chamadas || { posts: 0, hora: 0 };
export async function getPosts() { 'use cache'; cacheLife('hours'); cacheTag('posts'); globalThis.__chamadas.posts++; return ['a', 'b', 'v' + globalThis.__chamadas.posts]; }
export async function getHora() { 'use cache'; cacheLife({ stale: 1, revalidate: 1, expire: 60 }); globalThis.__chamadas.hora++; return 'h' + globalThis.__chamadas.hora; }
