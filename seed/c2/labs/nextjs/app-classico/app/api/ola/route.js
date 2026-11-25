export async function GET(req) { const u = new URL(req.url); return Response.json({ ola: u.searchParams.get('n') ?? 'mundo', t: 1 }); }
export async function POST(req) { const b = await req.json().catch(() => null); if (!b) return Response.json({ erro: 'json inválido' }, { status: 400 }); return Response.json({ recebido: b }, { status: 201 }); }
