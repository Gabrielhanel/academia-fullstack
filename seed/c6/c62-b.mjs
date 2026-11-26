// C6.2 — CI/CD e GitHub Actions. Aulas 3 e 4 (pipelines de deploy; blue-green e canary).
const R = String.raw;

export const REF2 = {
  ghaEnv: { title: 'GitHub Docs — Managing environments for deployment', url: 'https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/manage-environments', kind: 'doc' },
  ghaOidcAws: { title: 'GitHub Docs — Configuring OpenID Connect in cloud providers', url: 'https://docs.github.com/en/actions/how-tos/secure-your-work/security-harden-deployments/oidc-in-cloud-providers', kind: 'doc' },
  fowlerBlueGreen: { title: 'Martin Fowler — BlueGreenDeployment', url: 'https://martinfowler.com/bliki/BlueGreenDeployment.html', kind: 'artigo' },
  fowlerCanary: { title: 'Martin Fowler — CanaryRelease', url: 'https://martinfowler.com/bliki/CanaryRelease.html', kind: 'artigo' },
  fowlerParallel: { title: 'Martin Fowler — ParallelChange (expandir e contrair)', url: 'https://martinfowler.com/bliki/ParallelChange.html', kind: 'artigo' },
  nginxUpstream: { title: 'nginx — ngx_http_upstream_module', url: 'https://nginx.org/en/docs/http/ngx_http_upstream_module.html', kind: 'doc' },
  nginxControl: { title: 'nginx — Controlling nginx (reload)', url: 'https://nginx.org/en/docs/control.html', kind: 'doc' },
  argoRollouts: { title: 'Argo Rollouts — Progressive Delivery for Kubernetes', url: 'https://argoproj.github.io/rollouts/', kind: 'doc' }
};

export const lessonsB = [
{
  id: 'cicd-03', moduleId: 'm2', order: 3, minutes: 80, tags: ['deploy', 'ambientes', 'aprovação', 'OIDC', 'promoção', 'rollback', 'migrações', 'smoke test'],
  title: 'Pipelines de deploy: ambientes, aprovações, credenciais efêmeras, verificação e rollback',
  objectives: ['Projetar um pipeline publicar → homologação → produção com ambientes e aprovações', 'Usar OIDC para credenciais temporárias em vez de segredos de longa duração', 'Planejar verificação pós-deploy e rollback, incluindo migrações de banco', 'Interpretar erros de dependência entre jobs apontados pelo actionlint'],
  intro: R`Construir e testar é só metade do caminho: **o deploy é o momento mais arriscado**. Um bom **pipeline de deploy** **promove o mesmo artefato** por **ambientes**, **pede aprovação onde o risco justifica**, **usa credenciais efêmeras**, **verifica** que o novo serviço **realmente funciona** e **sabe voltar atrás**. Nesta aula você lê o **deploy.yml do laboratório**, **incluindo um erro real que o actionlint achou no primeiro rascunho**.`,
  theory: R`### Promoção entre ambientes
O **artefato é construído uma vez** (job §publicar§: **imagem com tag do SHA**, **publicada em um registro**) e **promovido**: **homologação** → **produção**. **Cada ambiente** tem **configuração e segredos próprios** (**não** no artefato). **Ambientes do GitHub** (§environment:§) **permitem**:
- **revisores obrigatórios** (**aprovação humana antes do job de produção**);
- **temporizador de espera**, **restrição de ramos/tags** que podem implantar;
- **segredos e variáveis por ambiente** (**só liberados ao job que declara o ambiente**);
- **URL do ambiente** e **histórico de implantações** no repositório.
**Entrega contínua** = **produção exige aprovação**; **implantação contínua** = **sem revisor**, **com verificação automática forte**.

### O deploy.yml do laboratório
**Três jobs encadeados**: §publicar§ (**build da imagem**, **saída §imagem§**), §homologacao§ (§environment: homologacao§: **deploy** e **teste de fumaça**) e §producao§ (§environment: producao§ com **URL**: **deploy** e **verificação**). **Gatilhos:** **tag §v*§** (**release**) ou **disparo manual** (§workflow_dispatch§ com **escolha de ambiente**). Detalhes: §concurrency§ com §cancel-in-progress: false§ (**nunca cancele um deploy em andamento**: **dois deploys no mesmo ambiente** **se enfileiram**), §timeout-minutes§ e **permissões por job** (§id-token: write§ **só** onde **OIDC** é necessário).

### Um erro real, achado pelo actionlint
O **primeiro rascunho** do §producao§ tinha §needs: homologacao§ **e usava** §needs.publicar.outputs.imagem§. O **actionlint 1.7.12** **recusou**: **§property "publicar" is not defined in object type {homologacao: ...}§**. **Por quê?** **Um job só enxerga as saídas dos jobs listados em seu §needs§** (**diretos**); **transitividade não vale para o contexto §needs§**. **Correção:** §needs: [publicar, homologacao]§; **o segundo lint passou (exit 0)**. **Lição:** **sem o lint**, **o erro só apareceria no deploy de produção**, **com a expressão vazia** e **uma imagem em branco** no comando de deploy.

### Credenciais efêmeras com OIDC
**Chaves de nuvem de longa duração** em segredos são **risco**: **vazam**, **não expiram**, **dificultam auditoria**. **OIDC:** o **GitHub emite um token de identidade assinado** para **cada execução** (**repositório, ramo/tag, ambiente**); **a nuvem confia no emissor** e **troca o token por credenciais temporárias** (**minutos**), **restritas por condições** (**só o ambiente producao do repositório X**). **Requisitos:** §permissions: id-token: write§ **no job**; **papel (role) na nuvem com política de confiança** **restrita ao repositório e ao ambiente**; **permissões mínimas** do papel. **Não executado** aqui: **não havia conta de nuvem**; é **análise** da documentação.

### Verificação pós-deploy e rollback
- **Teste de fumaça (smoke test):** **poucas chamadas** que provam **que o serviço sobe e responde** (§/saude§, **uma consulta ao banco**, **uma rota crítica**) **antes de liberar tráfego**.
- **Verificação em produção:** **taxa de erros e latência** nos **primeiros minutos** **comparadas à linha de base**; **falhou → rollback automático**.
- **Rollback:** **reimplantar o artefato anterior** (**por isso tags imutáveis e retenção de imagens**); **ensaiado**, **não improvisado**. **Mais rápido:** **troca de tráfego** (**aula 4**) **ou desligar a feature flag**.
- **Migrações de banco:** **o maior obstáculo ao rollback**. **Padrão expandir e contrair (parallel change):** (1) **expandir** (**adicionar** coluna/tabela **compatível com a versão antiga**); (2) **implantar** o código novo **que escreve nos dois**; (3) **migrar dados**; (4) **contrair** (**remover** o antigo **em um release posterior**). **Assim, o rollback do código nunca encontra um esquema incompatível.**
- **Configuração:** **mude uma coisa por vez** (**código** ou **configuração**), **versione** as duas.

### Boas práticas de pipeline de deploy
- **Mesmo artefato em todos os ambientes** (**digest**, **não tag móvel**).
- **Ambientes protegidos** para produção; **separação de funções** (**quem escreve** não **aprova sozinho**, quando exigido por conformidade).
- **Janelas e congelamentos** **como política**, **não como medo**: **o objetivo é tornar o deploy rotineiro**.
- **Trilha de auditoria**: **quem**, **o quê**, **quando**, **qual commit** (**histórico de implantações** + **tags**).
- **Observabilidade** conectada: **marcadores de deploy nos gráficos** **facilitam correlacionar** **mudança e incidente**.
- **GitOps** (**o estado desejado no Git**, **um agente no cluster reconcilia**, como **Argo CD**/**Flux**) **é uma alternativa ao "push" por pipeline** (**curso anterior**): **auditável** e **autocorretivo**.

### Executado e não executado
**Executado:** **actionlint** em §deploy.yml§ (**1 erro real no rascunho; aprovado após a correção**). **Não executado:** **o workflow no GitHub**, **ambientes e revisores**, **OIDC com nuvem**, **registros**, **os scripts §deploy.sh§, §smoke-test.sh§ e §verify.sh§** (**são nomes ilustrativos**).`,
  concepts: [
    { term: 'Promoção de artefato', def: 'Prática de levar o mesmo artefato por homologação e produção, mudando apenas a configuração.' },
    { term: 'Environment (GitHub)', def: 'Alvo de implantação com segredos, revisores e regras de proteção próprios.' },
    { term: 'Smoke test', def: 'Verificação mínima que confirma que o serviço sobe e responde após um deploy.' },
    { term: 'Rollback', def: 'Retorno a uma versão anterior conhecida e funcional após uma implantação ruim.' },
    { term: 'Expandir e contrair', def: 'Padrão de migração em etapas compatíveis (parallel change) que permite reverter o código sem reverter o esquema.' },
    { term: 'GitOps', def: 'Modelo em que o estado desejado fica no Git e um agente reconcilia o ambiente com ele.' },
    { term: 'Credencial efêmera', def: 'Credencial temporária, emitida sob demanda e restrita por condições, em vez de uma chave de longa duração.' }
  ],
  examples: R`**Analogia:** o pipeline de deploy é **um voo comercial**: **checklist antes da decolagem** (smoke test), **autorização da torre para pistas críticas** (aprovação do ambiente de produção), **crachá temporário** para entrar na área restrita (OIDC) e **procedimento de arremetida ensaiado** (rollback).

**Exemplo concreto (medido):** no §deploy.yml§ do laboratório o **actionlint** achou que §needs.publicar§ era **inacessível** no job §producao§; **a correção** (§needs: [publicar, homologacao]§) **passou**. Sem o lint, **o comando de deploy receberia a imagem vazia** só na produção.`,
  code: [
    { title: 'Jobs de homologação e produção com ambientes (deploy.yml, aprovado pelo actionlint 1.7.12 após a correção)', lang: 'yaml', code: R`  homologacao:
    needs: publicar
    runs-on: ubuntu-24.04
    environment: homologacao
    steps:
      - run: ./deploy.sh homologacao "DOLAR{{ needs.publicar.outputs.imagem }}"
      - run: ./smoke-test.sh https://homologacao.exemplo.com
  producao:
    needs: [publicar, homologacao]   # corrigido: antes era só homologacao
    runs-on: ubuntu-24.04
    environment:
      name: producao
      url: https://app.exemplo.com
    steps:
      - run: ./deploy.sh producao "DOLAR{{ needs.publicar.outputs.imagem }}"
      - run: ./verify.sh https://app.exemplo.com`, notes: [{ l: 4, t: 'O ambiente carrega segredos e regras de proteção próprios.' }, { l: 9, t: 'Sem listar publicar, a saída dele não existe neste job.' }, { l: 11, t: 'Revisores obrigatórios configurados no ambiente pausam o job.' }] },
    { title: 'Trecho de OIDC (esboço de análise; não executado: sem conta de nuvem)', lang: 'yaml', code: R`    permissions:
      id-token: write      # permite pedir o token de identidade
      contents: read
    steps:
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::111111111111:role/deploy-producao
          aws-region: sa-east-1
      # A política de confiança do papel restringe repositório e ambiente.`, notes: [{ l: 2, t: 'Sem id-token: write o workflow não obtém o token.' }, { l: 7, t: 'Conta fictícia (exemplo); a confiança é limitada ao repositório e ao ambiente.' }] }
  ],
  bestPractices: ['Construa e publique o artefato uma vez e promova pelo digest.', 'Proteja o ambiente de produção com revisores e restrição de ramos ou tags.', 'Prefira OIDC e papéis de menor privilégio a chaves de longa duração.', 'Nunca cancele deploys em andamento: use concurrency com fila.', 'Verifique após o deploy e automatize o rollback com critérios claros.', 'Use migrações em expandir e contrair para permitir rollback do código.', 'Rode o actionlint nos workflows de deploy: erros de needs e expressões só aparecem na hora errada.'],
  mistakes: ['Reconstruir a imagem para produção.', 'Usar chaves de nuvem de longa duração em segredos.', 'cancel-in-progress em deploy e deixar o ambiente em estado parcial.', 'Deploy sem teste de fumaça ou verificação.', 'Migração destrutiva acoplada ao deploy, sem caminho de volta.', 'Referenciar a saída de um job que não está em needs.'],
  market: R`**Pipelines de deploy seguros** (**ambientes, OIDC, rollback**) **são tema central** de **entrevistas de DevOps/SRE** e **de auditorias de segurança**.`,
  summary: R`Um pipeline de deploy promove o mesmo artefato por ambientes com segredos e regras próprios, pede aprovação onde o risco exige, usa OIDC para credenciais efêmeras, verifica com teste de fumaça e métricas e tem rollback ensaiado; migrações em expandir e contrair preservam a reversibilidade. No laboratório, o actionlint 1.7.12 achou em um rascunho de deploy.yml que o job de produção não enxergava a saída de publicar por faltar no needs; corrigido, o arquivo passou. Os workflows não rodaram no GitHub e OIDC com nuvem não foi executado.`,
  refs: [REF2.ghaEnv, REF2.ghaOidcAws, REF2.fowlerParallel],
  cards: [
    { q: 'Por que usar OIDC no deploy?', a: 'Troca o token de identidade da execução por credenciais temporárias e restritas, sem guardar chaves de longa duração.' },
    { q: 'Por que producao precisava listar publicar em needs?', a: 'O contexto needs só contém os jobs listados; a saída de publicar não é herdada por transitividade (achado do actionlint).' },
    { q: 'Como permitir rollback do código com mudança de esquema?', a: 'Expandir e contrair: adicionar compatível, implantar, migrar dados e só depois remover o antigo em outro release.' },
    { q: 'Por que não cancelar deploys em andamento?', a: 'Cancelar pode deixar o ambiente em estado parcial; é melhor enfileirar com cancel-in-progress falso.' }
  ]
},
{
  id: 'cicd-04', moduleId: 'm2', order: 4, minutes: 85, tags: ['blue-green', 'canary', 'rolling', 'nginx', 'upstream', 'rollback', 'feature flags', 'entrega progressiva'],
  title: 'Blue-green e canary: liberar com pouco risco, executado com nginx',
  objectives: ['Comparar recreate, rolling, blue-green e canary e escolher por risco e custo', 'Implementar troca de tráfego e liberação gradual com um proxy nginx', 'Interpretar o experimento: proporção do canary, troca sem erros e rollback', 'Reconhecer os limites: dados, sessões e a necessidade de métricas para decidir'],
  intro: R`**Publicar para todos de uma vez** é **apostar tudo**. **Estratégias de liberação** **reduzem o raio de impacto** e **encurtam a volta**. Aqui você **executa** duas delas com **dois nginx de aplicação** e **um nginx de borda**: **blue-green** (**troca instantânea e reversível**) e **canary** (**uma fração pequena** do tráfego **antes** da fração total), **medindo** o que acontece.`,
  theory: R`### As estratégias
| Estratégia | Como | Vantagem | Custo / risco |
|---|---|---|---|
| **Recreate** | para a versão antiga e **sobe** a nova | simples; **sem versões simultâneas** | **indisponibilidade** |
| **Rolling** | **substitui instâncias aos poucos** (**maxSurge/maxUnavailable**, curso anterior) | **sem indisponibilidade**; sem capacidade dobrada | **duas versões convivem**; rollback **lento** |
| **Blue-green** | **dois ambientes completos**; **troca o tráfego de uma vez** | **troca e rollback instantâneos**; **testa o novo em ambiente real** antes | **capacidade dobrada**; **dados/sessões compartilhados** |
| **Canary** | **envia uma fração** (1%, 5%, 25%...) **à nova versão** e **observa** | **menor raio de impacto**; **decisão por dados** | **precisa de métricas e automação**; **duas versões convivem** |
| **Feature flag** | **código novo desligado**, **ligado por usuário/percentual** | **separa deploy de release**; **rollback = desligar** | **dívida de flags**; **combinatória de testes** |
**Regra prática:** **quanto maior o risco e a escala**, **mais gradual**; **mudança pequena e reversível** aceita **rolling** simples.

### O laboratório (executado, nginx 1.31.10 e Docker 29.9.3)
**Topologia:** §lab-cicd-blue§ (**v1**) e §lab-cicd-green§ (**v2**) (**nginx servindo um JSON estático**) e §lab-cicd-front§ (**nginx de borda** com **§upstream app { server blue; server green; }§** e §proxy_pass§). **A troca de pesos é uma edição do §front.conf§ seguida de §nginx -s reload§** (**recarga graciosa**: **conexões em andamento terminam** nos antigos *workers*).
**Fases e resultados medidos:**
1. **100% blue:** **50 de 50** respostas **v1**.
2. **Canary 9:1:** **200 requisições → 180 v1 e 20 v2** (**exatamente 90/10**: o nginx usa **round-robin ponderado determinístico**; **com tráfego real e várias conexões a proporção oscila**).
3. **Blue-green:** **durante 300 requisições seguidas**, **recarga com blue "down" e green "ativo"**: **300 × HTTP 200, nenhuma falha**; **depois**, **50 de 50 v2**.
4. **Rollback:** **mesma operação ao contrário**: **50 de 50 v1**.

### Um achado: o reload que falha mantém a configuração antiga
A **primeira tentativa** usou §weight=0§ para "desligar" um servidor: o nginx **recusou** (**§invalid parameter "weight=0"§**). **O reload falhou, o nginx continuou com a configuração anterior** e **a "troca" não aconteceu**: **depois dela, o tráfego continuou 45/5 e 44/6 (v1/v2) em vez de 0/50**. **Conclusões:** (1) **desligue servidores com a diretiva §down§**, **não com peso 0**; (2) **valide a configuração antes** (§nginx -t§) **e confira o resultado** (**o comando de reload "terminou" sem efeito**); (3) **um pipeline deve verificar que a nova versão recebe tráfego**, **não presumir**. **Qualidade do experimento:** **o erro foi registrado**, **não escondido**.

### Como decidir no canary (o que o laboratório NÃO fez)
Um canary **real** **compara** **a versão nova com a antiga** em **métricas** (**taxa de erros**, **latência p95/p99**, **saturação**, **métricas de negócio**) **por um tempo e volume suficientes** (**poucos pedidos não dão significância estatística**), **avança** (**1% → 5% → 25% → 100%**) **ou reverte** **automaticamente**. **Ferramentas:** **Argo Rollouts**, **Flagger**, **service meshes** (**divisão por peso e por cabeçalho**), **balanceadores de nuvem**. **No laboratório não havia métricas nem automação**: **só a mecânica de divisão de tráfego**.

### Armadilhas
- **Dados e esquema:** **blue e green compartilham o banco**: **a migração tem de ser compatível com as duas versões** (**expandir e contrair**, aula 3).
- **Sessões e cache:** **afinidade de sessão**, **caches** e **conexões persistentes** **mantêm usuários na versão antiga** (**no nginx, §ip_hash§ ou cookies** **alteram a proporção**).
- **Custo:** **blue-green dobra a capacidade** durante a janela; **desligue o ambiente antigo** depois de **um período de segurança**.
- **Mensagens e filas:** **consumidores de duas versões** **precisam entender os mesmos formatos**.
- **Observabilidade:** **identifique a versão em logs e métricas** (**rótulo §versao§**), **ou não dá para comparar**.
- **DNS e TTL:** **trocar por DNS é lento e imprevisível**; **troque no balanceador/proxy** quando possível.

### Em Kubernetes
**Rolling update** é **nativo** (**Deployment**); **blue-green** = **dois Deployments** e **trocar o selector do Service**; **canary** = **Ingress com pesos**, **service mesh** ou **Argo Rollouts**. **Nenhum cluster foi usado neste curso**: **o princípio é o mesmo, a mecânica muda**.`,
  concepts: [
    { term: 'Blue-green', def: 'Estratégia com dois ambientes completos em que o tráfego é trocado de uma vez, permitindo rollback instantâneo.' },
    { term: 'Canary', def: 'Liberação em que uma pequena fração do tráfego vai à nova versão, que é observada antes de ampliar.' },
    { term: 'Rolling update', def: 'Substituição gradual das instâncias da versão antiga pela nova, sem indisponibilidade.' },
    { term: 'Upstream (nginx)', def: 'Grupo de servidores de aplicação para os quais o nginx distribui requisições.' },
    { term: 'Reload gracioso', def: 'Recarga de configuração em que novos workers assumem e os antigos terminam as conexões em andamento.' },
    { term: 'Liberação progressiva', def: 'Conjunto de técnicas (canary, flags, rolling) que expõem uma mudança a parcelas crescentes de usuários.' },
    { term: 'Raio de impacto', def: 'Parcela de usuários ou sistemas afetada por uma falha em uma mudança.' }
  ],
  examples: R`**Analogia:** **blue-green** é **ter dois palcos montados** e **girar a plateia** de um para o outro **num instante** (se o novo show der errado, **gira de volta**); **canary** é **mandar uma fila pequena de convidados** para **provar o prato novo** **antes** de abrir o salão (**o canário nas minas** avisava do perigo **antes dos mineiros**).

**Exemplo concreto (medido):** **200 requisições** com **pesos 9:1** deram **180 v1 e 20 v2**; **a troca sob carga** de **300 requisições** teve **300 respostas 200**; **e a tentativa com §weight=0§ foi recusada**, mantendo a versão anterior (**um reload com erro não derruba o serviço, mas também não aplica a mudança**).`,
  code: [
    { title: 'Borda nginx com canary 9:1 (medido: 180 v1 e 20 v2 em 200 requisições)', lang: 'nginx', code: R`upstream app {
  server lab-cicd-blue:80 weight=9;
  server lab-cicd-green:80 weight=1;
}
server {
  listen 80;
  location / { proxy_pass http://app; }
}`, notes: [{ l: 2, t: 'Pesos relativos: 9 para cada 1.' }, { l: 7, t: 'O proxy distribui por round-robin ponderado.' }] },
    { title: 'Troca blue-green: green ativo, blue desligado (300 × HTTP 200 durante a troca)', lang: 'nginx', code: R`upstream app {
  server lab-cicd-blue:80 down;   # weight=0 é inválido: use down
  server lab-cicd-green:80 weight=1;
}
# aplicar e conferir:
#   docker exec lab-cicd-front nginx -t
#   docker exec lab-cicd-front nginx -s reload`, notes: [{ l: 2, t: 'down remove o servidor do rodízio sem apagá-lo da configuração.' }, { l: 6, t: 'Valide com -t e depois confira o tráfego real.' }] },
    { title: 'Medindo a distribuição e os códigos HTTP', lang: 'bash', code: R`# distribuição (200 requisições)
for i in $(seq 1 200); do curl -s http://127.0.0.1:38081/; echo; done | sort | uniq -c
# códigos durante a troca (rode a troca em outro terminal)
for i in $(seq 1 300); do curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:38081/; done | sort | uniq -c`, notes: [{ l: 2, t: 'uniq -c conta quantas respostas de cada versão.' }, { l: 5, t: 'Qualquer código diferente de 200 indicaria indisponibilidade na troca.' }] }
  ],
  bestPractices: ['Escolha a estratégia pelo risco, pela reversibilidade e pelo custo.', 'Desligue servidores com down e valide com nginx -t antes de recarregar.', 'Confira, após o reload, que o tráfego realmente mudou.', 'No canary, compare métricas entre versões e automatize o avanço e a reversão.', 'Identifique a versão em logs e métricas.', 'Mantenha migrações compatíveis com as duas versões.', 'Desligue o ambiente antigo depois de um período de segurança para não pagar capacidade dobrada.'],
  mistakes: ['Usar weight=0 e achar que o servidor saiu do rodízio.', 'Reload sem nginx -t e sem conferir o resultado.', 'Canary sem métricas: só dividir o tráfego não decide nada.', 'Blue-green com esquema de banco incompatível entre versões.', 'Afinidade de sessão que invalida a proporção do canary.', 'Trocar por DNS esperando efeito instantâneo.'],
  market: R`**Liberação progressiva** (**canary, blue-green, flags**) **é conhecimento esperado** de **plataforma e SRE**, **e** entrevistas pedem **comparar estratégias e seus riscos**.`,
  summary: R`Recreate, rolling, blue-green, canary e feature flags trocam simplicidade, custo e reversibilidade. No laboratório (nginx 1.31.10), pesos 9:1 deram 180 v1 e 20 v2 em 200 requisições, uma troca blue-green sob 300 requisições teve 300 respostas 200 e o rollback levou 50 de 50 ao blue. A primeira tentativa com weight=0 foi recusada e o reload falho manteve a configuração antiga, então a troca não ocorreu; o certo é a diretiva down, com nginx -t e conferência do tráfego. Não havia métricas nem automação de canary nem cluster Kubernetes.`,
  refs: [REF2.fowlerBlueGreen, REF2.fowlerCanary, REF2.nginxUpstream, REF2.nginxControl, REF2.argoRollouts],
  cards: [
    { q: 'Qual a diferença entre blue-green e canary?', a: 'Blue-green troca todo o tráfego de uma vez entre dois ambientes completos; canary envia uma fração pequena à nova versão e amplia conforme as métricas.' },
    { q: 'Por que weight=0 falhou no nginx?', a: 'O nginx recusa o parâmetro e o reload falho mantém a configuração antiga; use a diretiva down.' },
    { q: 'Qual o principal custo do blue-green?', a: 'Capacidade dobrada durante a janela e a necessidade de dados e esquema compatíveis com as duas versões.' },
    { q: 'O que faltava no laboratório para um canary de verdade?', a: 'Métricas comparativas, volume suficiente e automação de avanço e reversão (por exemplo, Argo Rollouts).' }
  ]
}
];
