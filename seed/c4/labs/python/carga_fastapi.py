import asyncio, subprocess, sys, time, httpx
PORTA = 59300
print('Python', sys.version.split()[0], '| uvicorn 0.54.0 | 1 worker | httpx 0.28.1 | 200 requisições por rota, 20 simultâneas, cada rota "espera" 50 ms')
srv = subprocess.Popen([sys.executable, '-m', 'uvicorn', 'app_fastapi:app', '--host', '127.0.0.1', '--port', str(PORTA), '--log-level', 'warning'])
async def main():
    async with httpx.AsyncClient(base_url=f'http://127.0.0.1:{PORTA}', timeout=60) as c:
        for _ in range(60):
            try: await c.get('/openapi.json'); break
            except httpx.HTTPError: await asyncio.sleep(0.25)
        for rota in ['/espera/async-correta', '/espera/sync', '/espera/async-bloqueante']:
            sem = asyncio.Semaphore(20); lat = []
            async def um():
                async with sem:
                    t0 = time.perf_counter(); r = await c.get(rota); lat.append((time.perf_counter() - t0) * 1000); assert r.status_code == 200
            t0 = time.perf_counter(); await asyncio.gather(*[um() for _ in range(200)]); total = time.perf_counter() - t0
            lat.sort(); print(rota.ljust(26), 'tempo total %6.2f s | %6.1f req/s | latência p50 %7.0f ms | p95 %7.0f ms' % (total, 200 / total, lat[len(lat) // 2], lat[int(len(lat) * 0.95)]))
        t0 = time.perf_counter(); rr = await asyncio.gather(c.get('/espera/async-bloqueante'), c.get('/busca?q=ab')); 
        print('uma rota bloqueante atrasa as outras: /busca (instantânea) levou', end=' '); t1 = time.perf_counter(); b = asyncio.create_task(c.get('/espera/async-bloqueante')); await asyncio.sleep(0.01); t2 = time.perf_counter(); await c.get('/busca?q=ab'); print('%.0f ms enquanto uma rota async-bloqueante rodava' % ((time.perf_counter() - t2) * 1000)); await b
asyncio.run(main()); srv.terminate(); srv.wait()
