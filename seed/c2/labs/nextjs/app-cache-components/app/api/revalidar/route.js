import { revalidateTag } from 'next/cache';
export async function POST() { revalidateTag('posts', 'max'); return Response.json({ ok: true }); }
