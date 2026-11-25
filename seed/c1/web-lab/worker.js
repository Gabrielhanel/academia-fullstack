self.onmessage = (e) => {
  const d = e.data;
  if (d.tipo === 'soma') { let s = 0; for (let i = 0; i < d.n; i++) s += i % 7; self.postMessage({ tipo: 'resultado', s }); }
  else if (d.tipo === 'buffer') { self.postMessage({ tipo: 'tamanho', bytes: d.buf.byteLength }, [d.buf]); }
  else if (d.tipo === 'erro') { throw new Error('falha no worker'); }
  else if (d.tipo === 'clone') { self.postMessage({ tipo: 'clone', data: d.valor, ehFuncao: typeof d.valor.f }); }
  else if (d.tipo === 'dom') { self.postMessage({ tipo: 'dom', document: typeof document, window: typeof window, self: typeof self, fetch: typeof fetch, idb: typeof indexedDB, local: typeof localStorage }); }
};
