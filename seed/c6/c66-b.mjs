// C6.6 — Monitoramento. Aulas 3 e 4 (Grafana; alertas e on-call).
const R = String.raw;

export const REF2 = {
  grafanaDocs: { title: 'Grafana — Documentation', url: 'https://grafana.com/docs/grafana/latest/', kind: 'doc' },
  grafanaProv: { title: 'Grafana — Provision Grafana', url: 'https://grafana.com/docs/grafana/latest/administration/provisioning/', kind: 'doc' },
  grafanaDash: { title: 'Grafana — Dashboards', url: 'https://grafana.com/docs/grafana/latest/dashboards/', kind: 'doc' },
  grafanaBest: { title: 'Grafana — Dashboard best practices', url: 'https://grafana.com/docs/grafana/latest/dashboards/build-dashboards/best-practices/', kind: 'guia' },
  grafanaHttp: { title: 'Grafana — HTTP API', url: 'https://grafana.com/docs/grafana/latest/developers/http_api/', kind: 'doc' },
  promAlertRules: { title: 'Prometheus — Alerting rules', url: 'https://prometheus.io/docs/prometheus/latest/configuration/alerting_rules/', kind: 'doc' },
  promUnitTest: { title: 'Prometheus — Unit testing for rules', url: 'https://prometheus.io/docs/prometheus/latest/configuration/unit_testing_rules/', kind: 'doc' },
  amDocs: { title: 'Alertmanager — Overview', url: 'https://prometheus.io/docs/alerting/latest/alertmanager/', kind: 'doc' },
  amConfig: { title: 'Alertmanager — Configuration', url: 'https://prometheus.io/docs/alerting/latest/configuration/', kind: 'doc' },
  promAlertPractices: { title: 'Prometheus — Alerting best practices', url: 'https://prometheus.io/docs/practices/alerting/', kind: 'guia' },
  sreAlerting: { title: 'Google SRE Workbook — Alerting on SLOs', url: 'https://sre.google/workbook/alerting-on-slos/', kind: 'livro' },
  sreOncall: { title: 'Google SRE Book — Being On-Call', url: 'https://sre.google/sre-book/being-on-call/', kind: 'livro' },
  srePostmortem: { title: 'Google SRE Book — Postmortem Culture', url: 'https://sre.google/sre-book/postmortem-culture/', kind: 'livro' }
};

export const lessonsB = [
{
  id: 'mon-03', moduleId: 'm2', order: 3, minutes: 75, tags: ['Grafana', 'dashboards', 'provisionamento', 'datasource', 'painéis', 'RED', 'dashboards como código'],
  title: 'Grafana: dashboards úteis, provisionamento como código e verificação por API',
  objectives: ['Explicar o papel do Grafana (visualização sobre fontes de dados) e a diferença entre painel e alerta', 'Provisionar datasource e dashboard por arquivos (dashboards como código)', 'Desenhar dashboards orientados a perguntas (RED, SLO) e evitar painéis decorativos', 'Verificar o resultado pela API HTTP e confirmar que a consulta via Grafana coincide com a do Prometheus'],
  intro: R`**Métricas guardadas e ninguém olhando** **não ajudam**. O **Grafana** **consulta fontes de dados** (**Prometheus, Loki, bancos, nuvem**) **e as exibe em dashboards**. **O mais importante não é desenhar gráficos bonitos**, e sim **fazer as perguntas certas** e **tratar o dashboard como código**: **versionado, revisado e reproduzível**. **Nesta aula você sobe o Grafana 13.3.2** **com datasource e dashboard provisionados por arquivos** **e os verifica pela API.** **Aviso de segurança do laboratório:** **o acesso anônimo como Admin foi usado só no ambiente local**; **em qualquer ambiente real, use autenticação (SSO), papéis e rede privada.**`,
  theory: R`### O que o Grafana faz (e não faz)
**Faz:** **consultar** **fontes de dados**, **visualizar** (**séries temporais, tabelas, medidores, mapas**), **organizar** em **dashboards e pastas**, **variáveis** (**filtros reutilizáveis**), **anotações** (**marcas de deploy**), **alertas** (**do próprio Grafana**: **não executado neste curso**), **controle de acesso**. **Não armazena as métricas** (**quem armazena é o Prometheus ou outro**). **Painel x alerta:** **o painel é para investigação humana**; **o alerta é para chamar a atenção de quem pode agir** (**aula 4**).

### Dados: datasource
**Datasource** = **conexão com uma fonte** (**URL, tipo, autenticação**). **Provisionado por arquivo** (**no laboratório**):
§§§
apiVersion: 1
datasources:
  - name: Prometheus
    uid: prom
    type: prometheus
    access: proxy
    url: http://lab-mon-prom:9090
    isDefault: true
§§§
**Pontos:** **§uid§ fixo** (**os dashboards referenciam o uid, tornando-os portáteis entre ambientes**); **§access: proxy§** (**o servidor Grafana consulta**, **o navegador não precisa alcançar o Prometheus**); **segredos** (**tokens, senhas**) **via variáveis de ambiente ou *secure JSON*, nunca no arquivo versionado**.

### Dashboards como código
**Criar dashboards manualmente na interface** **gera "snowflakes"**: **ninguém sabe quem mudou o quê**, **ambientes divergem** e **a perda do banco do Grafana apaga o trabalho**. **Provisionamento por arquivos:** **um provedor aponta uma pasta de JSON**:
§§§
apiVersion: 1
providers:
  - name: lab
    type: file
    options:
      path: /var/lib/grafana/dashboards-lab
§§§
**O dashboard é um JSON** (**§uid§, §title§, §panels§ com §targets§ que contêm a expressão PromQL e a referência ao datasource**). **Fluxo recomendado:** **desenhar na interface**, **exportar o JSON**, **versionar no Git, revisar por pull request e publicar por provisionamento ou API/Terraform/Grafonnet** (**estes últimos não executados**). **Ambientes:** **mesmo dashboard, datasource por variável ou uid por ambiente**.

### O dashboard do laboratório
**Três painéis** (**RED, resumidos**):
1. **Requisições por segundo** — §app:http_requests:taxa30s§ (**Rate**);
2. **Razão de erros** — §app:http_erros:razao30s§ (**Errors**);
3. **Latência p95** — §histogram_quantile(0.95, sum by (le) (rate(http_request_duration_seconds_bucket[1m])))§ (**Duration**).
**Observe:** **os dois primeiros usam as regras de gravação da aula 2**: **consultas rápidas e consistentes com os alertas**. **O terceiro herda a limitação do histograma** (**p95 de ~0,375 s contra 300 ms exatos no laboratório**): **o painel deve deixar claro que é uma estimativa por bucket**.

### Verificação por API (medido, Grafana 13.3.2)
**Em vez de abrir o navegador**, **confirmou-se o resultado por HTTP**:
| Verificação | Resultado |
|---|---|
| §/api/health§ | **database: ok; version: 13.3.2** |
| §/api/search?type=dash-db§ | **1 dashboard provisionado: "App do laboratório"** |
| §/api/dashboards/uid/app-lab§ | **3 painéis: Requisições por segundo / Razão de erros / Latência p95 (histograma)** |
| §/api/datasources/uid/prom/health§ | **OK — "Successfully queried the Prometheus API."** |
| consulta §up{job="app"}§ **via proxy do Grafana** | **1** — **igual à consulta direta no Prometheus (1)** |
**Valor:** **a mesma verificação pode virar um teste de CI do ambiente** (**"o dashboard existe, a fonte está saudável e uma consulta devolve dados"**). **Não executado:** **abertura do dashboard no navegador e captura de tela**: **a renderização visual não foi verificada**.

### O que faz um bom dashboard
- **Comece por perguntas**, não por métricas: "**o serviço está atendendo bem os usuários?**", "**o que mudou?**", "**onde está o gargalo?**".
- **Hierarquia:** **visão geral** (**RED/SLO**, **poucos painéis**) → **por serviço** → **por dependência/recurso (USE)**.
- **Unidades e escalas claras**, **títulos que dizem o que mostram e o que fazer**, **limites (thresholds) visíveis** (**SLO como linha**).
- **Percentis e taxas**, **não médias soltas**; **eixos que não enganam** (**ex.: eixo Y começando em zero para taxas**).
- **Variáveis** (**serviço, ambiente**) **para reutilizar um dashboard**; **anotações de deploy** **para correlacionar mudança e incidente**.
- **Evite:** **dezenas de painéis "para ter tudo"**, **gráficos sem dono**, **cores sem significado** e **consultas pesadas em atualização muito frequente** (**carrega o Prometheus**).
- **Teste com uma pessoa nova na equipe:** **ela consegue dizer, em 30 s, se está tudo bem?**

### Segurança e operação do Grafana
**Autenticação** (**SSO/OIDC, LDAP**), **papéis por organização/pasta**, **sem acesso anônimo em produção**, **HTTPS atrás de um proxy (curso C6.3)**, **segredos fora do código**, **atualizações regulares** (**Grafana tem vulnerabilidades corrigidas com frequência**), **backup do banco** (**se houver conteúdo fora do código**) **e limites de consulta**. **O acesso anônimo Admin do laboratório é inaceitável fora de uma máquina local isolada.**

### Executado e não executado
**Executado:** **Grafana 13.3.2 com provisionamento de datasource e dashboard e verificação pela API**. **Não executado:** **interface web (visual)**, **variáveis, anotações, painéis de logs, alertas do Grafana, Loki/Tempo, SSO, Terraform/Grafonnet, plugins**.`,
  concepts: [
    { term: 'Grafana', def: 'Plataforma de visualização e exploração de dados de várias fontes, com dashboards, variáveis e alertas.' },
    { term: 'Datasource', def: 'Conexão configurada do Grafana com uma fonte de dados, como o Prometheus.' },
    { term: 'Provisionamento', def: 'Criação de datasources e dashboards a partir de arquivos de configuração, em vez de manualmente pela interface.' },
    { term: 'Dashboard como código', def: 'Prática de definir dashboards em arquivos versionados e revisados.' },
    { term: 'Painel', def: 'Visualização individual dentro de um dashboard, associada a uma ou mais consultas.' },
    { term: 'Variável de dashboard', def: 'Parâmetro que permite filtrar ou alterar consultas e reaproveitar o mesmo dashboard.' },
    { term: 'Anotação', def: 'Marca no gráfico que indica um evento, como um deploy.' },
    { term: 'SLO line', def: 'Linha de limite no painel que mostra o objetivo de nível de serviço.' }
  ],
  examples: R`**Analogia:** **o dashboard é o painel de um carro**: **poucos mostradores essenciais** (velocidade, combustível, luz de alerta) **e não 200 ponteiros**. **Provisionar como código é ter o projeto do painel no manual de fábrica**: **se um carro é perdido, outro igual é montado**; **o painel feito "no improviso" por cada motorista nunca fica igual**.

**Exemplo concreto (medido):** **ao subir o Grafana 13.3.2 com dois arquivos de provisionamento**, **a API mostrou 1 dashboard com 3 painéis**, **saúde do datasource OK e a consulta §up{job="app"}§ via Grafana igual à do Prometheus (1)**.`,
  code: [
    { title: 'Dashboard em JSON (trecho do arquivo provisionado)', lang: 'json', code: R`{
  "uid": "app-lab",
  "title": "App do laboratório",
  "schemaVersion": 39,
  "refresh": "5s",
  "time": { "from": "now-15m", "to": "now" },
  "panels": [
    { "id": 1, "type": "timeseries", "title": "Requisições por segundo",
      "gridPos": { "h": 8, "w": 12, "x": 0, "y": 0 },
      "datasource": { "type": "prometheus", "uid": "prom" },
      "targets": [ { "refId": "A", "expr": "app:http_requests:taxa30s" } ] }
  ]
}`, notes: [{ l: 2, t: 'uid fixo torna o dashboard endereçável e portátil.' }, { l: 10, t: 'Referência ao datasource por uid.' }, { l: 11, t: 'Usa a regra de gravação da aula 2.' }] },
    { title: 'Verificação por API (resultados medidos nos comentários)', lang: 'bash', code: R`curl -s http://127.0.0.1:38103/api/health
# database: ok, version: 13.3.2
curl -s "http://127.0.0.1:38103/api/search?type=dash-db"
# 1 dashboard: App do laboratório
curl -s http://127.0.0.1:38103/api/datasources/uid/prom/health
# OK - Successfully queried the Prometheus API.
curl -s "http://127.0.0.1:38103/api/datasources/proxy/uid/prom/api/v1/query?query=up%7Bjob%3D%22app%22%7D"
# valor 1, igual ao Prometheus direto`, notes: [{ l: 1, t: 'Porta e acesso anônimo valem apenas para o laboratório local.' }, { l: 7, t: 'O proxy do Grafana consulta o Prometheus em nome do cliente.' }] }
  ],
  bestPractices: ['Trate dashboards e datasources como código: versionados, revisados e provisionados.', 'Comece pelas perguntas e use hierarquia: visão geral, serviço, recurso.', 'Use regras de gravação para consultas pesadas e consistentes com os alertas.', 'Mostre SLOs e limites, use percentis e deixe claro quando algo é estimativa (histograma).', 'Use variáveis e anotações de deploy para reaproveitar e correlacionar.', 'Verifique o provisionamento por API no CI.', 'Em produção: SSO, papéis, HTTPS, segredos fora do código e sem acesso anônimo.'],
  mistakes: ['Dashboards criados e alterados à mão sem versionamento.', 'Dezenas de painéis sem pergunta clara.', 'Médias no lugar de percentis.', 'Segredos em arquivos de datasource versionados.', 'Acesso anônimo ou Admin fora do laboratório.', 'Atualização muito frequente com consultas pesadas.', 'Achar que a API saudável prova que o visual está correto.'],
  market: R`**Grafana** **é a ferramenta de dashboards mais usada**; **dashboards como código e provisionamento** **separam equipes maduras** **das que perdem o trabalho a cada migração**.`,
  summary: R`O Grafana visualiza dados de fontes como o Prometheus; painéis servem à investigação e alertas ao chamamento. Datasource e dashboard foram provisionados por arquivos (dashboards como código) com Grafana 13.3.2 e verificados pela API: health com database ok, 1 dashboard com 3 painéis, saúde do datasource OK e a consulta up via Grafana igual à direta no Prometheus. Bons dashboards partem de perguntas, têm hierarquia, mostram SLOs e usam percentis; em produção exigem autenticação, papéis e HTTPS, sem o acesso anônimo usado no laboratório. A renderização visual, variáveis, alertas do Grafana, Loki e SSO não foram executados.`,
  refs: [REF2.grafanaDocs, REF2.grafanaProv, REF2.grafanaDash, REF2.grafanaBest, REF2.grafanaHttp],
  cards: [
    { q: 'Por que provisionar dashboards como código?', a: 'Para versioná-los e revisá-los, reproduzi-los em qualquer ambiente e não perdê-los com o banco do Grafana.' },
    { q: 'Qual a diferença entre painel e alerta?', a: 'O painel apoia a investigação humana; o alerta chama a atenção de quem pode agir.' },
    { q: 'O que a verificação por API confirmou no laboratório?', a: 'Saúde do Grafana, 1 dashboard com 3 painéis, datasource saudável e consulta via Grafana igual à do Prometheus.' },
    { q: 'Por que o acesso anônimo Admin é inaceitável em produção?', a: 'Qualquer pessoa com acesso à rede poderia alterar dashboards, fontes e configurações; use SSO, papéis e rede privada.' }
  ]
},
{
  id: 'mon-04', moduleId: 'm2', order: 4, minutes: 95, tags: ['alertas', 'Alertmanager', 'for', 'agrupamento', 'on-call', 'SLO', 'burn rate', 'runbook', 'postmortem', 'webhook'],
  title: 'Alertas e on-call: regras com for, Alertmanager, SLOs e a cadeia completa executada até um webhook',
  objectives: ['Escrever regras de alerta por sintoma, com for, rótulos e anotações, e testá-las', 'Configurar o Alertmanager (agrupamento, roteamento, receivers) e interpretar o tempo até a notificação', 'Calcular burn rate de SLO e entender o alerta em múltiplas janelas', 'Descrever práticas de on-call: severidade, runbooks, escalonamento e postmortem sem culpa'],
  intro: R`**Um alerta ruim acorda a pessoa errada à noite ou nunca acorda.** **Boas regras avisam de sintomas que afetam o usuário, com urgência proporcional e um caminho de ação.** **Aqui você executa a cadeia completa:** **app → Prometheus (regra com §for§) → Alertmanager (agrupamento) → webhook**, **medindo os tempos** **de cada etapa**, **tanto no disparo quanto na resolução**. **Os receivers reais** (**e-mail, Slack, PagerDuty**) **não foram executados.**`,
  theory: R`### Alertar sobre sintomas, não sobre causas
**Sintoma:** **"usuários recebem erros" (taxa de erro alta)** **ou "o serviço está lento"** — **afeta quem usa e exige ação.** **Causa:** **"CPU a 90%"**, **"disco a 80%"** — **só alerte se prever problema iminente** (**disco que enche em 4 h**). **Regras:** (1) **todo alerta que acorda alguém exige uma ação humana imediata**; (2) **o que não exige ação vira painel ou ticket**; (3) **prefira poucos alertas bons**. **Alertas demais causam fadiga e são ignorados.**

### Regra de alerta (Prometheus)
§§§
- alert: TaxaDeErroAlta
  expr: app:http_erros:razao30s > 0.05
  for: 15s
  labels:
    severidade: critica
  annotations:
    resumo: Taxa de erro acima de 5%
§§§
- **§expr§:** **condição** (**qualquer série retornada = condição verdadeira**).
- **§for§:** **a condição precisa ficar verdadeira por esse tempo** **antes de disparar**: **o alerta fica *pending*, depois *firing***. **Evita alertar por picos curtos**; **em produção, de minutos**.
- **§labels§:** **roteamento** (**severidade, equipe, serviço**); **§annotations§:** **texto para humanos** (**resumo, descrição, §runbook_url§, painel**).
**Máquina de estados:** **inativo → pending → firing → (resolvido)**. **A métrica sintética §ALERTS§** **registra os estados** (**usada nas medições abaixo**). **Testes:** §promtool test rules§ **valida o disparo e a ausência dele** (**aula 2**: **o teste correto passou e o que esperava o alerta cedo demais falhou, "got: []"**).

### Alertmanager
**Recebe alertas do Prometheus e decide quem é avisado, como e quando.** **Funções:**
- **Agrupamento** (§group_by§): **junta alertas parecidos em uma só notificação** (**evita 100 mensagens na queda de um cluster**);
- **Temporizadores:** §group_wait§ (**espera para juntar o primeiro grupo**), §group_interval§ (**intervalo entre atualizações do mesmo grupo**), §repeat_interval§ (**reenvio enquanto continuar disparando**);
- **Roteamento** (**árvore de rotas por rótulos**: **críticos para o plantão, avisos para um canal**);
- **Inibição** (§inhibit_rules§): **suprime alertas de sintomas quando a causa raiz já alertou**;
- **Silêncios:** **suprimem temporariamente (manutenção planejada)**, **com autor, motivo e prazo**;
- **Receivers:** **e-mail, Slack, PagerDuty, Opsgenie, webhook**. **Alta disponibilidade:** **várias instâncias em cluster** (**não executado**).
**Configuração do laboratório:** **uma rota para um receiver webhook, §group_by: [alertname]§, §group_wait: 5s§, §group_interval: 10s§, §send_resolved: true§** (**validada por §amtool check-config§: SUCCESS**).

### A cadeia completa, medida
**Experimento (executado):** **tráfego saudável**, **depois 40 s com 30% de erros**, **depois 60 s saudáveis**; **num segundo cenário**, **parar o contêiner do app**. **Tempos medidos** (**scrape e avaliação a cada 5 s; janela do rate de 30 s; §for: 15s§ e §for: 10s§; §group_wait: 5s§**):
| Etapa | **TaxaDeErroAlta** (do início dos erros) | **AppForaDoAr** (do §docker stop§) |
|---|---|---|
| **pending** | **+10 s** | **+14 s** |
| **firing** | **+25 s** | **+24 s** |
| **webhook recebe "firing"** | **+30 s** | **+30 s** |
**Resolução:**
- **TaxaDeErroAlta**: **última amostra firing a +24 s** **do início da recuperação** e **webhook "resolved" a +30 s** (**a janela de 30 s ainda continha erros**);
- **AppForaDoAr**: **webhook "resolved" a +9 s depois do §docker start§**.
**Decomposição do atraso:** **janela do rate (suaviza) + scrape (≤ 5 s) + avaliação (≤ 5 s) + §for§ + §group_wait§**. **Em produção, com scrape de 15 s, janelas de minutos e §for§ de minutos, o alerta leva vários minutos**: **projete esses números de acordo com a urgência e o custo de falsos positivos.** **Como alertas só chegam ao webhook se o Alertmanager estiver saudável**, **monitore-o e teste o caminho de notificação periodicamente** (**alerta "watchdog" que sempre dispara**).

### SLOs e alertas por taxa de consumo (burn rate)
**SLO** (**objetivo de nível de serviço**): **ex.: 99,9% de requisições bem-sucedidas em 30 dias** → **orçamento de erro de 0,1%**. **Burn rate** = **razão de erros observada ÷ orçamento**: **1 consome o orçamento exatamente em 30 dias**; **10 consome em 3 dias**. **Com SLO de 99,9% e 1% de erros: burn rate 10**. **Alerta multijanela e multi-burn-rate** (**SRE Workbook**): **página** se **burn rate ≥ 14,4 em 1 h** (**consumiu 2% do orçamento**: 14,4 × 1 h ÷ 720 h = 2%) **e confirmado em 5 min**; **página** se **≥ 6 em 6 h** (**5%**); **ticket** se **≥ 1 em 3 dias** (**10%**). **Vantagens:** **alinhado ao impacto no usuário**, **menos falsos positivos**, **detecção rápida de incêndios e lenta de vazamentos**. **Não executado:** **os alertas de burn rate** (**apenas modelados no exercício**).

### On-call: o lado humano
- **Severidade e resposta:** **crítica** (**acorda: impacto ao usuário agora**) × **aviso** (**horário comercial**) × **informativo**.
- **Runbooks:** **link na anotação do alerta**, **passos de diagnóstico, mitigação e escalonamento**, **mantidos após cada incidente**.
- **Rotação e escalonamento:** **escala justa, passagem de turno documentada, segundo nível** (**se não houver reconhecimento em N minutos**); **compensação e limite de carga** (**o livro de SRE sugere em torno de no máximo dois incidentes por turno**).
- **Resposta a incidentes:** **comando claro, comunicação de status, mitigar antes de investigar a causa raiz**.
- **Postmortem sem culpa:** **linha do tempo, impacto, causas contribuintes, o que funcionou e itens de ação com dono e prazo**; **foco no sistema, não em pessoas**.
- **Higiene dos alertas:** **revisão periódica** (**quais acordaram à toa?**), **remover ou ajustar**, **métricas de qualidade** (**% de pages acionáveis**).

### Executado e não executado
**Executado:** **regras de alerta com §for§**, **testes de regras**, **Alertmanager com webhook (firing e resolved)**, **medição dos tempos**. **Não executado:** **inibição, silêncios, roteamento por severidade, receivers reais, HA do Alertmanager, alertas de burn rate, alertas do Grafana, ferramentas de plantão**.`,
  concepts: [
    { term: 'Alerta pending/firing', def: 'Estados de uma regra de alerta: condição verdadeira aguardando o for (pending) e disparando (firing).' },
    { term: 'for', def: 'Tempo mínimo em que a condição deve permanecer verdadeira antes de o alerta disparar.' },
    { term: 'Alertmanager', def: 'Componente que agrupa, roteia, inibe e silencia alertas do Prometheus e os entrega a receivers.' },
    { term: 'Agrupamento', def: 'Junção de alertas semelhantes em uma única notificação por rótulos definidos em group_by.' },
    { term: 'Inibição', def: 'Supressão de alertas de sintomas quando um alerta de causa raiz já está ativo.' },
    { term: 'SLO', def: 'Objetivo de nível de serviço, como 99,9% de sucesso em 30 dias, que define um orçamento de erro.' },
    { term: 'Burn rate', def: 'Velocidade de consumo do orçamento de erro: razão de erros observada dividida pelo orçamento.' },
    { term: 'Runbook', def: 'Guia operacional com diagnóstico, mitigação e escalonamento para um alerta ou incidente.' },
    { term: 'Postmortem sem culpa', def: 'Análise posterior a um incidente focada em causas sistêmicas e ações de melhoria, não em culpados.' }
  ],
  examples: R`**Analogia:** **o alerta é o alarme de incêndio de um prédio**: **dispara por fumaça (sintoma), não por "temperatura do corredor 28 °C" (causa)**; **o §for§ evita que um cigarro aceso à janela chame os bombeiros**; **o Alertmanager é a central que agrupa 40 detectores em um só chamado**; **o runbook é o plano de evacuação na parede**. **E o postmortem é a investigação depois**, **que melhora o prédio sem culpar o morador**.

**Exemplo concreto (medido):** **depois de 30% de erros**, **o alerta foi pending em +10 s, firing em +25 s e chegou ao webhook em +30 s**; **ao parar o app, o alerta de alvo fora do ar chegou ao webhook em +30 s, e a resolução veio 9 s depois do §docker start§**.`,
  code: [
    { title: 'Roteamento e agrupamento no Alertmanager (laboratório; amtool: SUCCESS)', lang: 'yaml', code: R`route:
  receiver: hook
  group_by: [alertname]
  group_wait: 5s
  group_interval: 10s
  repeat_interval: 1h
receivers:
  - name: hook
    webhook_configs:
      - url: http://lab-mon-hook:9000/alerta
        send_resolved: true`, notes: [{ l: 3, t: 'Alertas com o mesmo alertname viram uma notificação.' }, { l: 4, t: 'Em produção costuma ser de 30 s ou mais.' }, { l: 11, t: 'Notifica também a resolução.' }] },
    { title: 'Alerta de burn rate em duas janelas (exemplo analisado; não executado)', lang: 'yaml', code: R`- alert: ErroBudgetQueimandoRapido
  expr: |
    (sum(rate(http_requests_total{status=~"5.."}[1h])) / sum(rate(http_requests_total[1h])) > 14.4 * 0.001)
    and
    (sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m])) > 14.4 * 0.001)
  for: 2m
  labels:
    severidade: critica
  annotations:
    resumo: Consumindo 2% do orçamento de erro em 1 hora (SLO 99,9%)
    runbook_url: https://exemplo.interno/runbooks/erro-budget`, notes: [{ l: 3, t: '14,4 x 0,001: burn rate vezes o orçamento de 0,1%.' }, { l: 5, t: 'A janela curta confirma que o problema continua e acelera a resolução.' }, { l: 12, t: 'URL fictícia, apenas ilustrativa.' }] }
  ],
  bestPractices: ['Alerte por sintomas com ação clara e trate o restante como painel ou ticket.', 'Use for para evitar picos e escolha os tempos conhecendo o atraso total (scrape, avaliação, janela, for, group_wait).', 'Teste as regras com promtool e valide o Alertmanager com amtool.', 'Agrupe, roteie por severidade, use inibição e silêncios com prazo e motivo.', 'Adote alertas de burn rate por SLO em múltiplas janelas.', 'Inclua runbook e painel nas anotações e mantenha-os após cada incidente.', 'Monitore o próprio caminho de alerta com um alerta watchdog e faça postmortems sem culpa.'],
  mistakes: ['Alertar sobre causas (CPU 80%) que não exigem ação.', 'Alertas sem for, que disparam por picos.', 'Sem runbook ou dono do alerta.', 'Nunca testar as regras nem o caminho de notificação.', 'Receivers sem confirmação de entrega e sem escalonamento.', 'Silêncios sem prazo nem motivo.', 'Culpar pessoas em vez de melhorar o sistema.'],
  market: R`**Alertas e on-call** são **o centro da prática de SRE**; **explicar alertar por sintoma, burn rate e postmortem sem culpa** **é pergunta frequente** em **entrevistas sêniores**.`,
  summary: R`Alertas devem avisar de sintomas que exigem ação, com for para evitar picos, rótulos para roteamento e anotações com runbook; as regras são testadas com promtool. O Alertmanager agrupa, roteia, inibe e silencia antes de notificar receivers. A cadeia foi executada de ponta a ponta: com 30% de erros o alerta ficou pending em +10 s, firing em +25 s e chegou ao webhook em +30 s, e a resolução chegou 30 s após a recuperação; com o app parado, pending em +14 s, firing em +24 s, webhook em +30 s e resolved 9 s após o docker start. SLOs e burn rate (14,4 em 1 h consome 2% do orçamento) alinham alertas ao usuário, e o on-call exige runbooks, escalonamento e postmortem sem culpa. Receivers reais, inibição, silêncios e alertas de burn rate não foram executados.`,
  refs: [REF2.promAlertRules, REF2.promUnitTest, REF2.amDocs, REF2.amConfig, REF2.promAlertPractices, REF2.sreAlerting, REF2.sreOncall, REF2.srePostmortem],
  cards: [
    { q: 'Por que alertar sobre sintomas e não sobre causas?', a: 'Sintomas (erros, lentidão) afetam o usuário e exigem ação; causas isoladas (CPU alta) geram falsos positivos e fadiga.' },
    { q: 'O que faz a cláusula for?', a: 'Exige que a condição permaneça verdadeira pelo tempo indicado antes de disparar (pending e depois firing), evitando alertas por picos curtos.' },
    { q: 'O que é burn rate?', a: 'A razão entre a taxa de erros observada e o orçamento do SLO; burn rate 1 consome o orçamento exatamente no período do SLO, 14,4 em 1 h consome 2%.' },
    { q: 'Quais etapas somam o atraso até a notificação?', a: 'Janela do rate, scrape, avaliação da regra, for e group_wait do Alertmanager (medido: +30 s do início dos erros ao webhook).' }
  ]
}
];
