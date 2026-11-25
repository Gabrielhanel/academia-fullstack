import { useState } from 'react';
export function Cadastro({ onEnviar }) {
  const [erro, setErro] = useState('');
  async function enviar(e) { e.preventDefault(); const fd = new FormData(e.currentTarget); const email = String(fd.get('email')); if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { setErro('E-mail inválido'); return; } setErro(''); await onEnviar({ nome: fd.get('nome'), email }); }
  return <form onSubmit={enviar}><label>Nome <input name="nome" /></label><label>E-mail <input name="email" /></label><button>Enviar</button>{erro && <p role="alert">{erro}</p>}</form>;
}
