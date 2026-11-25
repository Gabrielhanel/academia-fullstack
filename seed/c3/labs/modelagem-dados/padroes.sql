SET search_path = mod;
\echo '== soft delete e unicidade'
CREATE TABLE contas (id serial PRIMARY KEY, email text NOT NULL, removido_em timestamptz);
CREATE UNIQUE INDEX contas_email_ativo ON contas (email) WHERE removido_em IS NULL;
INSERT INTO contas (email) VALUES ('a@x');
INSERT INTO contas (email) VALUES ('a@x');
UPDATE contas SET removido_em = now() WHERE id = 1;
INSERT INTO contas (email) VALUES ('a@x');
SELECT id, email, removido_em IS NOT NULL AS removida FROM contas ORDER BY id;
CREATE TABLE contas_ingenua (id serial PRIMARY KEY, email text NOT NULL UNIQUE, removido_em timestamptz);
INSERT INTO contas_ingenua (email) VALUES ('a@x');
UPDATE contas_ingenua SET removido_em = now() WHERE id = 1;
INSERT INTO contas_ingenua (email) VALUES ('a@x');
\echo '== histórico com validade (sem sobreposição)'
CREATE EXTENSION IF NOT EXISTS btree_gist;
CREATE TABLE preco_hist (produto_id int, preco numeric(10,2) NOT NULL, validade tstzrange NOT NULL, EXCLUDE USING gist (produto_id WITH =, validade WITH &&));
INSERT INTO preco_hist VALUES (1, 10, '[2026-01-01,2026-06-01)'), (1, 12, '[2026-06-01,)');
INSERT INTO preco_hist VALUES (1, 11, '[2026-03-01,2026-04-01)');
SELECT preco FROM preco_hist WHERE produto_id = 1 AND validade @> timestamptz '2026-03-15';
SELECT preco FROM preco_hist WHERE produto_id = 1 AND validade @> timestamptz '2026-09-15';
\echo '== hierarquia: adjacência x ltree'
CREATE EXTENSION IF NOT EXISTS ltree;
CREATE TABLE cat (id serial PRIMARY KEY, caminho ltree NOT NULL);
CREATE INDEX ON cat USING gist (caminho);
INSERT INTO cat (caminho) VALUES ('eletronicos'), ('eletronicos.celulares'), ('eletronicos.celulares.smartphones'), ('livros');
SELECT caminho FROM cat WHERE caminho <@ 'eletronicos' ORDER BY caminho;
SELECT nlevel(caminho) AS nivel, caminho FROM cat ORDER BY caminho;
\echo '== EAV x colunas x JSONB'
CREATE TABLE eav (entidade int, atributo text, valor text);
INSERT INTO eav VALUES (1,'cor','azul'),(1,'peso','3'),(2,'cor','verde');
SELECT entidade, max(valor) FILTER (WHERE atributo = 'cor') AS cor, max(valor) FILTER (WHERE atributo = 'peso')::int AS peso FROM eav GROUP BY entidade ORDER BY 1;
INSERT INTO eav VALUES (2,'peso','pesado');
SELECT entidade, max(valor) FILTER (WHERE atributo = 'peso')::int AS peso FROM eav GROUP BY entidade;
