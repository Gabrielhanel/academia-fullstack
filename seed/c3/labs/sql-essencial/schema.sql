DROP SCHEMA IF EXISTS loja CASCADE; CREATE SCHEMA loja; SET search_path = loja;
CREATE TABLE clientes (id integer PRIMARY KEY, nome text NOT NULL, cidade text, email text UNIQUE);
CREATE TABLE produtos (id integer PRIMARY KEY, nome text NOT NULL, categoria text NOT NULL, preco numeric(10,2) NOT NULL CHECK (preco >= 0));
CREATE TABLE pedidos (id integer PRIMARY KEY, cliente_id integer NOT NULL REFERENCES clientes(id), data date NOT NULL, status text NOT NULL DEFAULT 'aberto');
CREATE TABLE itens (pedido_id integer REFERENCES pedidos(id), produto_id integer REFERENCES produtos(id), quantidade integer NOT NULL CHECK (quantidade > 0), PRIMARY KEY (pedido_id, produto_id));
INSERT INTO clientes VALUES (1,'Ana','Porto Alegre','ana@ex.com'),(2,'Bruno','Caxias do Sul',NULL),(3,'Carla','Porto Alegre','carla@ex.com'),(4,'Diego',NULL,'diego@ex.com');
INSERT INTO produtos VALUES (1,'Caneta','papelaria',3.50),(2,'Caderno','papelaria',18.90),(3,'Mochila','acessorios',120.00),(4,'Garrafa','acessorios',45.00),(5,'Lápis','papelaria',2.00);
INSERT INTO pedidos VALUES (10,1,'2026-01-05','pago'),(11,1,'2026-02-10','aberto'),(12,2,'2026-02-11','pago'),(13,3,'2026-03-01','cancelado');
INSERT INTO itens VALUES (10,1,10),(10,2,2),(11,3,1),(12,2,1),(12,4,2),(13,5,20);
