SET search_path = mod;
\echo '== N:N com tabela de ligação'
CREATE TABLE alunos (id serial PRIMARY KEY, nome text NOT NULL);
CREATE TABLE cursos (id serial PRIMARY KEY, titulo text NOT NULL);
CREATE TABLE matriculas (aluno_id int REFERENCES alunos(id) ON DELETE CASCADE, curso_id int REFERENCES cursos(id) ON DELETE RESTRICT, nota numeric(4,2) CHECK (nota BETWEEN 0 AND 10), em date DEFAULT current_date, PRIMARY KEY (aluno_id, curso_id));
INSERT INTO alunos (nome) VALUES ('Ana'),('Bruno'); INSERT INTO cursos (titulo) VALUES ('SQL'),('Java');
INSERT INTO matriculas (aluno_id, curso_id, nota) VALUES (1,1,9.5),(1,2,8),(2,1,7);
INSERT INTO matriculas (aluno_id, curso_id) VALUES (1,1);
INSERT INTO matriculas (aluno_id, curso_id, nota) VALUES (2,2,11);
INSERT INTO matriculas (aluno_id, curso_id) VALUES (3,1);
SELECT a.nome, string_agg(c.titulo, ', ' ORDER BY c.titulo) AS cursos, round(avg(m.nota),2) AS media FROM alunos a JOIN matriculas m ON m.aluno_id = a.id JOIN cursos c ON c.id = m.curso_id GROUP BY a.id ORDER BY a.id;
DELETE FROM cursos WHERE id = 1;
DELETE FROM alunos WHERE id = 2;
SELECT count(*) AS matriculas_restantes FROM matriculas;
\echo '== 1:1 (PK = FK)'
CREATE TABLE usuarios (id serial PRIMARY KEY, email text NOT NULL UNIQUE);
CREATE TABLE perfis (usuario_id int PRIMARY KEY REFERENCES usuarios(id) ON DELETE CASCADE, bio text);
INSERT INTO usuarios (email) VALUES ('a@x'); INSERT INTO perfis VALUES (1,'oi');
INSERT INTO perfis VALUES (1,'outro');
\echo '== autorrelacionamento'
CREATE TABLE funcionarios (id int PRIMARY KEY, nome text, gerente_id int REFERENCES funcionarios(id), CHECK (gerente_id <> id));
INSERT INTO funcionarios VALUES (1,'Chefe',NULL),(2,'Ana',1),(3,'Bia',2);
INSERT INTO funcionarios VALUES (4,'Loop',4);
WITH RECURSIVE cadeia AS (SELECT id, nome, 0 AS nivel FROM funcionarios WHERE id = 3 UNION ALL SELECT f.id, f.nome, c.nivel + 1 FROM funcionarios f JOIN funcionarios c0 ON false JOIN cadeia c ON f.id = (SELECT gerente_id FROM funcionarios WHERE id = c.id)) SELECT nivel, nome FROM cadeia ORDER BY nivel;
\echo '== domínio: tabela de domínio x CHECK x enum'
CREATE TABLE ped_status (codigo text PRIMARY KEY);
INSERT INTO ped_status VALUES ('aberto'),('pago');
CREATE TABLE ped_a (id int, status text REFERENCES ped_status(codigo));
CREATE TABLE ped_b (id int, status text CHECK (status IN ('aberto','pago')));
CREATE TYPE st AS ENUM ('aberto','pago');
CREATE TABLE ped_c (id int, status st);
INSERT INTO ped_a VALUES (1,'cancelado');
INSERT INTO ped_b VALUES (1,'cancelado');
INSERT INTO ped_c VALUES (1,'cancelado');
INSERT INTO ped_status VALUES ('cancelado');
INSERT INTO ped_a VALUES (1,'cancelado');
ALTER TYPE st ADD VALUE 'cancelado';
INSERT INTO ped_c VALUES (1,'cancelado');
\echo '== polimorfismo: FK que não existe'
CREATE TABLE comentarios_ruim (id int, alvo_tipo text, alvo_id int, texto text);
INSERT INTO comentarios_ruim VALUES (1,'post',999,'aponta para um post que não existe');
SELECT count(*) AS comentario_orfao_aceito FROM comentarios_ruim;
