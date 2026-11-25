"""Script de automação: lê CSVs de vendas de um diretório e gera um resumo JSON."""
from __future__ import annotations
import argparse, csv, json, logging, sys
from collections import defaultdict
from pathlib import Path

log = logging.getLogger('relatorio')

def ler_vendas(arquivo: Path) -> list[dict]:
    with arquivo.open(newline='', encoding='utf-8') as f:
        return [{**linha, 'valor': float(linha['valor'])} for linha in csv.DictReader(f)]

def resumir(pasta: Path) -> dict:
    por_loja: dict[str, float] = defaultdict(float); invalidas = 0; arquivos = 0
    for arq in sorted(pasta.glob('*.csv')):
        arquivos += 1
        try:
            for v in ler_vendas(arq): por_loja[v['loja']] += v['valor']
        except (KeyError, ValueError) as e:
            invalidas += 1; log.warning('arquivo inválido %s: %s', arq.name, e)
    return {'arquivos': arquivos, 'invalidos': invalidas, 'total': round(sum(por_loja.values()), 2), 'por_loja': dict(sorted(por_loja.items()))}

def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('pasta', type=Path); p.add_argument('--saida', type=Path); p.add_argument('-v', '--verbose', action='store_true')
    a = p.parse_args(argv)
    logging.basicConfig(level=logging.DEBUG if a.verbose else logging.WARNING, format='%(levelname)s %(message)s', stream=sys.stderr)
    if not a.pasta.is_dir(): log.error('pasta inexistente: %s', a.pasta); return 2
    r = resumir(a.pasta); texto = json.dumps(r, ensure_ascii=False, indent=2)
    (a.saida.write_text(texto, encoding='utf-8') if a.saida else print(texto)); return 0

if __name__ == '__main__': raise SystemExit(main())
