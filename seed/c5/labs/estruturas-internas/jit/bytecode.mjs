// Função pequena cujo bytecode o Ignition gera. Uso: node --print-bytecode --print-bytecode-filter=dobrarMaisUm jit/bytecode.mjs
function dobrarMaisUm(x) { return x * 2 + 1; }
console.log(dobrarMaisUm(20));
