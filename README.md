# EliteTicket

Plataforma de eventos e ingressos desenvolvida para o **Desafio Elite Dev 2026** (Verzel). Organizadores publicam eventos a partir de um catálogo externo, clientes reservam, pagam (simulado) e recebem ingressos com QR Code, e a portaria valida a entrada.

---

## Papéis do sistema

- **Organizador** — cria e gerencia eventos, com busca opcional no catálogo da Ticketmaster para pré-preencher dados.
- **Cliente** — navega pelos eventos, reserva, paga (simulado), recebe o ingresso com QR Code e pode compartilhá-lo por link.
- **Portaria** — valida ingressos na entrada, por leitura de câmera ou digitação manual, com retorno de válido / inválido / já utilizado / evento errado.

---

## Stack técnica

**Front-end:** React + Vite, React Router, Axios, `qrcode.react`, `html5-qrcode`.

**Back-end:** Node.js + Express, arquitetura em camadas (controllers/services/routes/middlewares).

**Banco de dados:** PostgreSQL, com Prisma como ORM/migrations (gerador `prisma-client-js`, com driver adapter `@prisma/adapter-pg`).

**Infraestrutura:** Docker + Docker Compose, containerizando o banco e o back-end, com hot-reload via `nodemon` dentro do container.

**API externa:** Ticketmaster Discovery API v2 (busca de shows para o organizador).

---

## Arquitetura

```
/EliteTicket
 ├── /backend           # Node.js + Express + Prisma
 ├── /frontend          # React + Vite
 ├── docker-compose.yml
 └── README.md
```

### Backend — camadas

```
/backend/src
 ├── /config
 ├── /controllers    # recebe req/res, chama o service, não tem regra de negócio
 ├── /services       # regras de negócio (auth, eventos, reservas, check-in, catálogo)
 ├── /routes
 ├── /middlewares     # autenticação (JWT) e autorização por papel
 └── /utils
```

### Frontend — organização por features

```
/frontend/src
 ├── /components      # componentes globais (ex: TicketCard)
 ├── /features
 │    ├── /auth
 │    ├── /events
 │    ├── /checkout
 │    ├── /tickets
 │    ├── /checkin
 │    └── /organizer
 ├── /services         # chamadas HTTP (axios) por domínio
 └── /pages
```

---

## Como rodar o projeto

### Pré-requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado e em execução
- Node.js (para instalar dependências do front-end localmente)

### 1. Clonar o repositório

```bash
git clone https://github.com/johnatanduarte/EliteTicket.git
cd EliteTicket
```

### 2. Configurar variáveis de ambiente

Copie o arquivo de exemplo e preencha os valores (veja a seção [Variáveis de ambiente](#variáveis-de-ambiente)):

```bash
cd backend
cp .env.example .env
```

### 3. Subir o backend e o banco de dados via Docker

Na raiz do projeto:

```bash
docker compose up --build
```

Isso sobe dois containers:
- `eliteticket_db` — PostgreSQL, exposto na porta `5433` do host (a `5432` costuma já estar em uso por instalações locais de Postgres)
- `eliteticket_backend` — API Express, exposta na porta `3000`, com migrations e client do Prisma gerados automaticamente na subida

A API fica disponível em `http://localhost:3000`.

### 4. Rodar o frontend

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

O frontend fica disponível em `http://localhost:5173`.

---

## Variáveis de ambiente

Arquivo `backend/.env`:

```
PORT=3000
DATABASE_URL=postgresql://eliteticket:eliteticket@db:5432/eliteticket
JWT_SECRET=<string longa e aleatória — usada para assinar tokens JWT e QR Codes>
TICKETMASTER_API_KEY=<sua chave obtida em developer.ticketmaster.com>
```

A `TICKETMASTER_API_KEY` é obtida gratuitamente criando uma conta em [developer.ticketmaster.com](https://developer.ticketmaster.com) — uma aplicação padrão com uma Consumer Key é criada automaticamente no cadastro.

---

## Banco de dados e migrations

O schema completo está em `backend/prisma/schema.prisma`. As migrations já geradas ficam em `backend/prisma/migrations` e são aplicadas automaticamente ao subir o container (via comando configurado no `docker-compose.yml`).

Para gerar uma nova migration manualmente, com os containers já rodando:

```bash
docker compose exec backend npx prisma migrate dev --name nome_da_migration
```

Para inspecionar o banco visualmente, conecte um cliente como pgAdmin ou DBeaver em:
- Host: `localhost`
- Porta: `5433`
- Usuário/senha: `eliteticket`
- Banco: `eliteticket`

---

## Fluxos principais

1. **Organizador** cria um evento — manualmente ou buscando um show no catálogo da Ticketmaster, que pré-preenche título, data e local (capacidade e preço são sempre definidos manualmente).
2. **Cliente** navega pelos eventos publicados, escolhe um, define a quantidade de ingressos e avança para o checkout.
3. **Pagamento simulado** — o cliente pode confirmar (gera o ingresso) ou simular uma recusa (libera o lugar reservado, nenhum ingresso é gerado).
4. **Ingresso** — aparece em "Meus Ingressos" com QR Code assinado digitalmente; pode ser compartilhado por um link público de leitura (sem exigir login de quem recebe).
5. **Portaria** seleciona o evento em cartaz e valida ingressos por leitura de câmera ou digitação manual, recebendo um dos quatro retornos: válido, inválido, já utilizado ou evento errado.

---

## Decisões técnicas e por quês

- **Uma tabela `User` com campo `role`**, em vez de tabelas separadas por papel: os três papéis compartilham os mesmos dados básicos; tabelas separadas gerariam complexidade sem ganho real.
- **`Event` guarda só `source` + `externalId`** da API externa, não duplica sinopse/imagens/elenco — esses dados, quando necessários, são buscados em tempo real, evitando um banco desatualizado e inchado.
- **Reserva por quantidade, não mapa de assentos nomeados** — resolve o fluxo básico de ponta a ponta com menos complexidade; a estrutura permite evoluir para assentos nomeados no futuro sem quebrar o schema.
- **Controle de concorrência** (não vender o mesmo lugar duas vezes) implementado com `$transaction` do Prisma: soma as reservas `PENDING`/`PAID` já existentes do evento e só confirma a nova reserva se ainda houver vaga disponível.
- **QR Code assinado com HMAC-SHA256** (não um UUID aleatório) — a assinatura é conferida no backend antes de qualquer consulta ao banco, então um código forjado é rejeitado imediatamente, sem custo de I/O.
- **Backend faz proxy da API da Ticketmaster**, em vez do frontend chamar direto — mantém a API Key secreta, nunca exposta no navegador.
- **Gerador do Prisma:** optamos pelo `prisma-client-js` (modo clássico, ainda suportado embora marcado como legado) em vez do novo gerador `prisma-client` da v7, porque este último força saída em TypeScript/ESM, incompatível com o projeto em JavaScript puro sem ferramentas adicionais de build.

---

## Testando pela rede local (celular)

Para testar a leitura de QR Code por câmera com um dispositivo separado (ex: celular como portaria, notebook mostrando o ingresso, ou vice-versa):

1. Descubra o IP local do computador que roda o projeto (`ipconfig` no Windows, procure por "Endereço IPv4").
2. Rode o frontend com `npm run dev -- --host` para expor na rede.
3. Libere as portas **5173** (frontend) e **3000** (backend) no Firewall do Windows — Firewall do Windows Defender → Regras de Entrada → Nova Regra → Porta → TCP → especificar a porta → Permitir a conexão → todos os perfis.
4. Acesse `http://SEU_IP_LOCAL:5173` a partir do outro dispositivo, conectado à mesma rede Wi-Fi.
