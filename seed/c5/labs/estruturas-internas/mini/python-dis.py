import dis, ast
def f(x): return x * 2 + 1
dis.dis(f)
print(ast.dump(ast.parse('x * 2 + 1', mode='eval').body))
