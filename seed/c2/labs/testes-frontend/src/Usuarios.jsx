import { useEffect, useState } from 'react';
export function Usuarios() {
  const [estado, setEstado] = useState({ status: 'carregando', dados: [] });
  useEffect(() => { let vivo = true; fetch('/api/usuarios').then((r) => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }).then((d) => vivo && setEstado({ status: 'ok', dados: d })).catch(() => vivo && setEstado({ status: 'erro', dados: [] })); return () => { vivo = false; }; }, []);
  if (estado.status === 'carregando') return <p>Carregando...</p>;
  if (estado.status === 'erro') return <p role="alert">Falha ao carregar</p>;
  return <ul>{estado.dados.map((u) => <li key={u.id}>{u.nome}</li>)}</ul>;
}
