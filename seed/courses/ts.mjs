// Curso 5 da Onda 1: TypeScript — fundamentos e recursos avançados.
import { makeCourse } from './_lib.mjs';
import { REF, lessonsA } from './ts-a.mjs';
import { lessonsB } from './ts-b.mjs';
import { exsets, assessment, project } from './ts-ex.mjs';

// Nos exemplos em String.raw, "DOLAR{" marca uma interpolação de template literal.
const dolar = (v) => (typeof v === 'string' ? v.replace(/DOLAR\{/g, '${') : Array.isArray(v) ? v.map(dolar) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, dolar(x)])) : v);
const lessons = dolar([...lessonsA, ...lessonsB]);
const glossary = lessons.flatMap((l) => l.concepts).concat([
  { term: 'Type assertion', def: 'Afirmação "valor as Tipo" que muda o tipo visto pelo compilador sem verificar nada em runtime.' },
  { term: 'Type guard', def: 'Verificação feita no código (typeof, in, instanceof ou função com "x is T") que estreita o tipo de um valor.' },
  { term: 'Declaration merging', def: 'Junção automática de várias declarações de interface com o mesmo nome em um único tipo.' }
]).filter((g, i, a) => a.findIndex((x) => x.term === g.term) === i);

const course = {
  id: 'typescript-fundamentos', disciplineId: 'ts', disciplineIds: [], areaId: 'front', requires: ['javascript-fundamentos'],
  title: 'TypeScript: fundamentos e recursos avançados',
  description: 'JavaScript com um sistema de tipos que acha erros antes de rodar. Do básico (inferência, unknown, strict) aos tipos de objeto, uniões e narrowing, funções e classes, generics, utility, mapped e conditional types, tsconfig e módulos. O curso termina na parte que mais importa em produção: validar em runtime os dados que o compilador não consegue garantir. Os desafios de código treinam essa parte em JavaScript e são corrigidos por testes automáticos; a parte de tipos é treinada com questões, rastreamento de tipos e correção de código.',
  objectives: ['Explicar o que o TypeScript garante (checagem antes de rodar) e o que não garante (dados em runtime)', 'Tipar variáveis, funções e objetos com inferência, interfaces e type aliases', 'Modelar alternativas com uniões discriminadas e verificar exaustividade com never', 'Escrever funções e tipos genéricos com restrições e keyof', 'Derivar tipos com utility types, mapped types e conditional types', 'Configurar um projeto com strict, módulos e import type', 'Validar dados externos em runtime antes de tratá-los como um tipo'],
  level: 'M', prereqs: ['JavaScript: variáveis, funções, objetos, arrays, módulos e Promises', 'Noções de terminal e de npm para instalar o compilador'], hours: 35,
  syllabus: 'O que é TypeScript, tipos básicos, inferência e strict; interfaces, type aliases, readonly e satisfies; uniões, narrowing e discriminated unions; funções, overloads e classes; generics; utility, mapped e conditional types; tsconfig, módulos e validação de dados na fronteira.',
  versions: 'TypeScript 5.x (conteúdo conforme o Handbook oficial; satisfies exige 4.9 ou superior). Os exemplos de tipos foram verificados com o compilador no modo strict. Os desafios de código rodam em JavaScript em um Web Worker da Academia, sem compilar TypeScript.',
  skills: ['Sistema de tipos e inferência', 'Tipos de objeto e tipagem estrutural', 'Uniões e narrowing', 'Funções e classes tipadas', 'Generics', 'Utility, mapped e conditional types', 'Configuração do tsconfig', 'Validação em runtime'],
  modules: [
    { id: 'm1', title: 'Fundamentos do sistema de tipos', lessons: ['ts-01', 'ts-02'] },
    { id: 'm2', title: 'Uniões, funções e classes', lessons: ['ts-03', 'ts-04'] },
    { id: 'm3', title: 'Tipos avançados e projeto real', lessons: ['ts-05', 'ts-06', 'ts-07'] }
  ],
  materials: [REF.scratch, REF.everyday, REF.narrowing, REF.generics, REF.tsconfig],
  projectIds: ['validador-tipado'],
  supplement: {
    glossary,
    cheatsheet: `### Tipos básicos
§string§ · §number§ · §boolean§ · §bigint§ · §symbol§ · §null§ · §undefined§ · §number[]§ · §[string, number]§ (tupla) · §unknown§ (seguro) · §any§ (desliga a checagem) · §never§ (sem valores).

### Objetos
§interface U { readonly id: number; nome: string; email?: string }§ · §type A = B & C§ · §{ [chave: string]: number }§ · §as const§ · §expr satisfies Tipo§.

### Uniões e narrowing
§type S = 'a' | 'b'§ · §typeof x === 'string'§ · §'p' in x§ · §x instanceof Date§ · §x != null§ · §function ehX(v: unknown): v is X§ · tag §kind§ + §switch§ + §const _: never = x§ no default.

### Funções e classes
§(a: number, b = 1, ...r: number[]): number§ · overloads: assinaturas + implementação · §this: T§ · §constructor(private readonly id: number)§ · §#privado§ (real) versus §private§ (só tipos).

### Generics
§function f<T extends { length: number }>(x: T): T§ · §<T, K extends keyof T>(o: T, k: K): T[K]§ · §type Par<A, B = A>§.

### Tipos derivados
§keyof T§ · §typeof v§ · §T['k']§ · §T[number]§ · §Partial§ §Required§ §Readonly§ §Pick§ §Omit§ §Record§ §Exclude§ §Extract§ §NonNullable§ §ReturnType§ §Parameters§ §Awaited§ · §{ [K in keyof T]-?: T[K] }§ · §T extends U ? X : Y§ com §infer§.

### tsconfig essencial
§"strict": true§ · §"noUncheckedIndexedAccess": true§ · §"module"§/§"moduleResolution"§ (§nodenext§ ou §bundler§) · §"noEmit": true§ · §import type { X } from './x'§ · §tsc --noEmit§ no CI.

### Fronteira
Dado externo: §unknown§ → guard/validação → tipo. §catch (err)§ é §unknown§: §err instanceof Error§.`,
    mistakes: ['Achar que o TypeScript valida os dados que chegam em runtime.', 'Usar "as" para calar o compilador.', 'Usar any em vez de unknown.', 'Modelar estados com campos opcionais em vez de uniões discriminadas.', 'Confiar que private do TypeScript protege dados em runtime.', 'Escrever generics em que o parâmetro de tipo aparece uma só vez.', 'Esperar que Omit acuse chaves que não existem.', 'Deixar strict desligado e conviver com erros de null.', 'Ler err.message sem estreitar o catch.', 'Tipos tão elaborados que ninguém da equipe consegue manter.'],
    prereqMap: `**Antes deste curso:** JavaScript (funções, objetos, arrays, módulos e Promises). O sistema avisa quando esse curso ainda não foi concluído, mas não bloqueia o acesso.

| Este curso prepara para | Por quê |
|---|---|
| React e Next.js | props, estado e hooks são tipados com interfaces, uniões e generics |
| Node.js, NestJS e APIs | contratos de entrada e saída, DTOs e validação na fronteira |
| ORMs e bancos de dados | os tipos das entidades vêm do esquema |
| Testes automatizados | tipos reduzem testes de forma, mas não substituem testes de comportamento |

Ordem interna: aulas 1 e 2 (tipos e objetos) → 3 e 4 (uniões, funções e classes) → 5 a 7 (generics, tipos derivados e projeto real).`,
    officialRefs: [REF.scratch, REF.everyday, REF.narrowing, REF.functions, REF.objects, REF.classes, REF.generics, REF.utility, REF.mapped, REF.conditional, REF.indexed, REF.modules, REF.tsconfig, REF.satisfies],
    practice: ['Instale o TypeScript (npm install --save-dev typescript), crie um tsconfig com "strict": true e rode npx tsc --noEmit em um arquivo seu.', 'Pegue um trecho de JavaScript que você escreveu e tipe-o sem usar any; liste onde o compilador achou problemas.', 'Modele o estado de uma tela (carregando, erro, sucesso) como união discriminada e escreva um switch exaustivo com never.', 'Escreva uma função genérica de cache tipada (chave e valor) e use-a com dois tipos diferentes.', 'Derive, a partir de um tipo Usuario, os tipos de criação, edição e resposta pública com Omit, Partial e Pick.', 'No projeto Validador, escreva o tipo Inferido<Esquema> e confira os exemplos com tsc --noEmit.']
  }
};

export const TS = makeCourse({ course, lessons, exsets, assessment, project });
