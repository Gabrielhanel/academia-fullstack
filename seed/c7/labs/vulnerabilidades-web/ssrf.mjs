// Defesas contra SSRF do laboratório C7.2: classificação de IPs, validação com lista de permissão e redirecionamentos revalidados.
// Limitação declarada: não impede DNS rebinding (o IP validado não é "fixado" na conexão).
export function ipv4Privado(ip) {
  const o = ip.split('.').map(Number); if (o.length !== 4 || o.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return true;
  const [a, b] = o;
  return a === 0 || a === 10 || a === 127 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127) || a >= 224;
}
export function ipPrivado(ip) {
  const x = ip.toLowerCase().replace(/^\[|\]$/g, '');
  if (!x.includes(':')) return ipv4Privado(x);
  if (x === '::' || x === '::1') return true;
  const m = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/.exec(x); if (m) return ipv4Privado(m[1]);
  if (/^f[cd]/.test(x)) return true;               // fc00::/7 (ULA)
  if (/^fe[89ab]/.test(x)) return true;            // fe80::/10 (link-local)
  return false;
}
export async function validarUrl(entrada, { permitidos, resolver }) {
  let u; try { u = new URL(entrada); } catch { return { ok: false, motivo: 'URL inválida' }; }
  if (!['http:', 'https:'].includes(u.protocol)) return { ok: false, motivo: 'protocolo não permitido' };
  if (u.username || u.password) return { ok: false, motivo: 'credenciais na URL' };
  const host = u.hostname.replace(/^\[|\]$/g, '');
  const ehIp = /^[\d.]+$/.test(host) || host.includes(':');
  if (!permitidos.includes(host)) return { ok: false, motivo: 'host fora da lista de permissão' };
  const ips = ehIp ? [host] : await resolver(host);
  if (!ips.length) return { ok: false, motivo: 'sem resolução' };
  if (ips.some(ipPrivado)) return { ok: false, motivo: 'endereço interno' };
  return { ok: true, url: u.href, ips };
}
export async function seguroFetch(entrada, { permitidos, resolver, fetchImpl = fetch, maxRedirects = 3 }) {
  let url = entrada;
  for (let i = 0; i <= maxRedirects; i++) {
    const v = await validarUrl(url, { permitidos, resolver });
    if (!v.ok) return { ok: false, motivo: v.motivo, url };
    const r = await fetchImpl(v.url, { redirect: 'manual', signal: AbortSignal.timeout(3000) });
    if (r.status >= 300 && r.status < 400 && r.headers.get('location')) { url = new URL(r.headers.get('location'), v.url).href; continue; }
    return { ok: true, status: r.status, corpo: (await r.text()).slice(0, 2000) };
  }
  return { ok: false, motivo: 'redirecionamentos demais', url };
}
