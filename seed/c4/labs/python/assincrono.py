import asyncio, sys, time, os, statistics
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor

async def trabalho(i: int, ms: int = 50): await asyncio.sleep(ms / 1000); return i

async def principal():
    print('== 1. 100 tarefas de 50 ms: sequencial x gather')
    t0 = time.perf_counter()
    for i in range(100): await trabalho(i)
    seq = time.perf_counter() - t0
    t0 = time.perf_counter(); r = await asyncio.gather(*[trabalho(i) for i in range(100)]); par = time.perf_counter() - t0
    print('sequencial: %.2f s | gather: %.3f s | ganho: %.0fx | ordem dos resultados preservada: %s' % (seq, par, seq / par, r == list(range(100))))

    print('\n== 2. TaskGroup: uma falha cancela as irmãs; gather(return_exceptions=True) isola')
    async def falha(): await asyncio.sleep(0.02); raise ValueError('boom')
    async def longa(): 
        try: await asyncio.sleep(1)
        except asyncio.CancelledError: print('  tarefa irmã cancelada'); raise
    try:
        async with asyncio.TaskGroup() as tg: tg.create_task(falha()); tg.create_task(longa())
    except* ValueError as eg: print('  TaskGroup propagou:', [repr(e) for e in eg.exceptions])
    r = await asyncio.gather(falha(), trabalho(1, 10), return_exceptions=True); print('  gather(return_exceptions=True):', r)

    print('\n== 3. timeout com asyncio.timeout')
    t0 = time.perf_counter()
    try:
        async with asyncio.timeout(0.1): await asyncio.sleep(1)
    except TimeoutError: print('  TimeoutError após %.0f ms (a tarefa interna foi cancelada)' % ((time.perf_counter() - t0) * 1000))

    print('\n== 4. chamada bloqueante dentro do event loop x asyncio.to_thread (100 ms bloqueantes + um "batimento" a cada 10 ms)')
    async def batimento(atrasos):
        prev = time.perf_counter()
        for _ in range(25): await asyncio.sleep(0.01); agora = time.perf_counter(); atrasos.append((agora - prev) * 1000 - 10); prev = agora
    a1 = []; b = asyncio.create_task(batimento(a1)); await asyncio.sleep(0.03); time.sleep(0.1); await b
    a2 = []; b = asyncio.create_task(batimento(a2)); await asyncio.sleep(0.03); await asyncio.to_thread(time.sleep, 0.1); await b
    print('  time.sleep(0.1) no loop → maior atraso do batimento: %.0f ms | asyncio.to_thread(time.sleep) → %.0f ms' % (max(a1), max(a2)))


def cpu(n): 
    s = 0
    for i in range(n): s += i * i
    return s

if __name__ == '__main__':
    print('Python', sys.version.split()[0], '| núcleos:', os.cpu_count(), '| GIL ativo:', sys._is_gil_enabled(), '| método de início de processos:', __import__('multiprocessing').get_start_method())
    asyncio.run(principal())

    N = 12_000_000
    print('\n== 5. CPU: o GIL — 4 tarefas de cálculo puro (cada uma %d iterações)' % N)
    t0 = time.perf_counter(); [cpu(N) for _ in range(4)]; t_seq = time.perf_counter() - t0
    with ThreadPoolExecutor(4) as ex:
        t0 = time.perf_counter(); list(ex.map(cpu, [N] * 4)); t_th = time.perf_counter() - t0
    with ProcessPoolExecutor(4) as ex:
        list(ex.map(cpu, [1000] * 4)); t0 = time.perf_counter(); list(ex.map(cpu, [N] * 4)); t_pr = time.perf_counter() - t0
    print('sequencial: %.2f s | 4 threads: %.2f s (%.2fx) | 4 processos: %.2f s (%.2fx)' % (t_seq, t_th, t_seq / t_th, t_pr, t_seq / t_pr))

    print('\n== 6. E/S: 100 "esperas" de 50 ms com threads (o GIL é liberado na espera)')
    t0 = time.perf_counter()
    with ThreadPoolExecutor(20) as ex: list(ex.map(lambda _: time.sleep(0.05), range(100)))
    print('20 threads: %.2f s (ideal 0,25 s) | sequencial seria %.1f s' % (time.perf_counter() - t0, 100 * 0.05))
