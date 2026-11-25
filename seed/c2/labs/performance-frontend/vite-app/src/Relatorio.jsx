import grande from './grande.js';
export default function Relatorio() { return <ul>{grande.slice(0, 20).map((d) => <li key={d}>{d}</li>)}</ul>; }
