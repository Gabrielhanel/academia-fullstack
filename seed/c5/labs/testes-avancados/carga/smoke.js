import http from 'k6/http';
import { check, sleep } from 'k6';
export const options = {
  vus: 1, duration: '5s',
  thresholds: { http_req_failed: ['rate<0.01'], http_req_duration: ['p(95)<100'] }
};
export default function () {
  const base = __ENV.BASE || 'http://127.0.0.1:4580';
  check(http.get(base + '/saude'), { 'saúde 200': (r) => r.status === 200 });
  check(http.get(base + '/clientes/1'), { 'cliente 200': (r) => r.status === 200 && r.json('nome') === 'Ana Souza' });
  sleep(0.2);
}
