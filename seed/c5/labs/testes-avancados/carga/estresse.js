import http from 'k6/http';
import { check } from 'k6';
// Aumenta a taxa de chegada até passar da capacidade do servidor (relatório de ~24 ms em uma única thread)
export const options = {
  scenarios: { estresse: { executor: 'ramping-arrival-rate', startRate: 10, timeUnit: '1s', preAllocatedVUs: 50, maxVUs: 150,
    stages: [{ target: 10, duration: '5s' }, { target: 30, duration: '5s' }, { target: 60, duration: '8s' }, { target: 100, duration: '8s' }] } },
  thresholds: { http_req_failed: ['rate<0.01'], http_req_duration: ['p(95)<500'] }
};
export default function () {
  const r = http.get((__ENV.BASE || 'http://127.0.0.1:4580') + '/relatorio?n=200000', { timeout: '30s' });
  check(r, { 'status 200': (x) => x.status === 200 });
}
