import { salvar } from './actions';
import { Cliente } from './cliente';
export default function A() { return <form action={salvar}><input name="nome" /><button>ok</button><Cliente dado={{ a: 1 }} /></form>; }
