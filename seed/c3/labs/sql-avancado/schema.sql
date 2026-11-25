DROP SCHEMA IF EXISTS vendas CASCADE; CREATE SCHEMA vendas; SET search_path = vendas;
CREATE TABLE vendedores (id int PRIMARY KEY, nome text NOT NULL, regiao text NOT NULL);
CREATE TABLE vendas (id int PRIMARY KEY, vendedor_id int NOT NULL REFERENCES vendedores(id), data date NOT NULL, valor numeric(10,2) NOT NULL, produto text NOT NULL);
INSERT INTO vendedores VALUES (1,'Ana','Sul'),(2,'Bruno','Sul'),(3,'Carla','Norte'),(4,'Diego','Norte');
INSERT INTO vendas VALUES
 (1,1,'2026-01-05',100,'A'),(2,1,'2026-01-20',150,'B'),(3,1,'2026-02-03',150,'A'),(4,1,'2026-03-10',300,'C'),
 (5,2,'2026-01-12',200,'A'),(6,2,'2026-02-14',200,'B'),(7,2,'2026-03-01',50,'A'),
 (8,3,'2026-01-30',500,'C'),(9,3,'2026-02-28',400,'C'),(10,3,'2026-03-15',100,'B'),
 (11,4,'2026-03-20',250,'A');
