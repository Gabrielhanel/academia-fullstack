import { NextResponse } from 'next/server';
export function proxy(req) { if (req.nextUrl.pathname.startsWith('/painel') && !req.cookies.get('sessao')) return NextResponse.redirect(new URL('/', req.url)); const r = NextResponse.next(); r.headers.set('x-lab', '1'); return r; }
export const config = { matcher: ['/painel/:path*', '/blog/:path*'] };
