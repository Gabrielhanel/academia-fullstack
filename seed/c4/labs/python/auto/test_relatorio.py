import json
from pathlib import Path
import pytest
from relatorio import main, resumir

@pytest.fixture
def pasta(tmp_path: Path) -> Path:
    (tmp_path / 'a.csv').write_text('loja,valor\nPOA,10.5\nSP,20\nPOA,4.5\n', encoding='utf-8')
    (tmp_path / 'b.csv').write_text('loja,valor\nSP,5\n', encoding='utf-8')
    return tmp_path

def test_resumo_soma_por_loja(pasta):
    r = resumir(pasta)
    assert r == {'arquivos': 2, 'invalidos': 0, 'total': 40.0, 'por_loja': {'POA': 15.0, 'SP': 25.0}}

def test_arquivo_invalido_nao_derruba(pasta, caplog):
    (pasta / 'c.csv').write_text('loja,valor\nRJ,abc\n', encoding='utf-8')
    r = resumir(pasta)
    assert r['invalidos'] == 1 and r['total'] == 40.0
    assert 'arquivo inválido c.csv' in caplog.text

def test_main_escreve_json(pasta, tmp_path):
    saida = tmp_path / 'saida.json'
    assert main([str(pasta), '--saida', str(saida)]) == 0
    assert json.loads(saida.read_text(encoding='utf-8'))['total'] == 40.0

def test_main_pasta_inexistente(tmp_path):
    assert main([str(tmp_path / 'nao-existe')]) == 2

@pytest.mark.parametrize('csv_texto,esperado', [('loja,valor\nA,1\nA,2\n', 3.0), ('loja,valor\n', 0.0)])
def test_parametrizado(tmp_path, csv_texto, esperado):
    (tmp_path / 'x.csv').write_text(csv_texto, encoding='utf-8')
    assert resumir(tmp_path)['total'] == esperado
