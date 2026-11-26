import http from 'k6/http';
import { check } from 'k6';
// Modelo aberto: 50 iterações por segundo durante 15 s, independentemente da latência do servidor
export const options = {
  scenarios: { carga: { executor: 'constant-arrival-rate', rate: 50, timeUnit: '1s', duration: '15s', preAllocatedVUs: 20, maxVUs: 100 } },
  thresholds: { http_req_failed: ['rate<0.01'], http_req_duration: ['p(95)<150'] }
};
export default function () {
  const base = __ENV.BASE || 'http://127.0.0.1:4580';
  const r = Math.random() < 0.8 ? http.get(base + '/clientes/1') : http.get(base + '/relatorio?n=100000');
  check(r, { 'status 200': (x) => x.status === 200 });
}
