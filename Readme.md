# Duckscreener aka FuelCharts

## General Setup:
Install dependencies:
```
pnpm i
```
Get an Envio API Token:
https://envio.dev/app/api-tokens

Set the token as ENVIO_API_TOKEN in /envio/.env
```
ENVIO_API_TOKEN="<YOUR-API-TOKEN>"
```

## Envio Setup (Indexer):
- HyperIndex is an open development framework for building backend's for blockchain applications. It is designed to be easy to use, extremely fast, and extensible.
- ✅ - Quickstart templates
- ✅ - Real-time indexing
- ✅ - Multichain indexing
- ✅ - Local development
- ✅ - Reorg support
- ✅ - GraphQL API
- ✅ - Any EVM & Fuel
- ✅ - 5000+ events indexed per second historical backfill
- ✅ - Auto generate an indexer with contract address
- ✅ - Flexible language support (JavaScript, TypeScript, ReScript)
- ✅ - 100,000+ factory contracts support
- ✅ - Onchain & offchain data support
- ✅ - Hosted service or easy self hosting
- ✅ - Detailed logging & error messaging
- ✅ - Actions to trigger external API services
- ✅ - Topic based indexing support (wildcard indexing)

- Follow the Envio HyperIndex docs at: https://docs.envio.dev/docs/HyperIndex/tutorial-indexing-fuel

### Quickstart Envio
This repo is committed with it's generated envio docker-compose.yaml and is setup to index MiraV1Core and BridgeFungibleToken contract events on the [Fuel Network](https://fuel.network). (See: /envio/config.yaml for configuration)

Each contract the system is listening to is defined in config.yaml, along with a mapping to their ABIs (the example contract ABIs can be found in /envio/abis)

Events defined in config.yaml manifest as postgres tables in the generated database based on the graphQL schema defined in /envio/schema.graphql, for example the MiraV1Core_SwapEvent:

```
type MiraV1Core_SwapEvent {
  id: ID!
  time: Int!
  block_height: Int!
  transaction_id: String!
  pool_id: String!
  recipient: String!
  asset_0_in: BigInt!
  asset_1_in: BigInt!
  asset_0_out: BigInt!
  asset_1_out: BigInt!
  exchange_rate: BigInt!
  is_buy: Boolean!
  is_sell: Boolean!
}
```

Notice additional fields exchange_rate, is_buy, is_sell on the type, we calculate these as events stream into the system and add them to the event record (tldr; you can do a lot to transform data into meaningful records as they processed rather than a post-creation process.) How we handle each event is managed in /envio/src/EventHandlers.ts:

```
MiraV1Core.SwapEvent.handler(async ({ event, context }) => {

  const is_buy = event.params.asset_1_in > 0;
  const is_sell = event.params.asset_1_out > 0;
  let exchange_rate = BigInt(0);
  try{
    if (is_buy) {
      exchange_rate = (BigInt(event.params.asset_1_in) * BigInt(10n ** 18n)) / BigInt(event.params.asset_0_out);
    } else {
      exchange_rate = (BigInt(event.params.asset_1_out) * BigInt(10n ** 18n)) / BigInt(event.params.asset_0_in);
    }
  }
  catch(e){
    console.log('Error calculating exchange rate', e);
  }
  

  const entity: MiraV1Core_SwapEvent = {
    id: `${event.chainId}_${event.block.height}_${event.logIndex}`,
    time: event.block.time,
    block_height: event.block.height,
    transaction_id: event.transaction.id,
    pool_id: `${event.params.pool_id[0].bits}_${event.params.pool_id[1].bits}_${event.params.pool_id[2]}`,
    recipient: event.params.recipient.payload.bits,
    asset_0_in: event.params.asset_0_in,
    asset_1_in: event.params.asset_1_in,
    asset_0_out: event.params.asset_0_out,
    asset_1_out: event.params.asset_1_out,
    exchange_rate: exchange_rate,
    is_buy: is_buy,
    is_sell: is_sell,
  };

  context.MiraV1Core_SwapEvent.set(entity);
});
```

If you choose to simply modify this repo rather than start from scratch with Envio, once you make changes to config.yaml and graphql.schema, run the following to generate all utility code and types for the entities you've defined:
```
#from project root
cd envio
pnpm codegen
```


We recommend making the following change to your generated Envio docker-compose:

Your generated docker-compose.yaml in /envio/generated should use the hasura/graphql-engine:v2.44.0.cli-migrations-v3 image
```
services:
  envio-postgres:
    image: postgres:16
    restart: always
    ports:
      - "${ENVIO_PG_PORT:-5433}:5432"
    volumes:
      - db_data:/var/lib/postgresql/data
    environment:
      POSTGRES_PASSWORD: ${ENVIO_POSTGRES_PASSWORD:-testing}
      POSTGRES_USER: ${ENVIO_PG_USER:-postgres}
      POSTGRES_DB: ${ENVIO_PG_DATABASE:-envio-dev}
    networks:
      - my-proxy-net
  graphql-engine:
    image: hasura/graphql-engine:v2.44.0.cli-migrations-v3
    ports:
      - "${HASURA_EXTERNAL_PORT:-8080}:8080"
    user: 1001:1001
    depends_on:
      - "envio-postgres"
    restart: always
    environment:
      # TODO: refine migrations. For now we will run hasura setup via custom scripts, rather than standard migrations.
      # See details of this image here: https://hasura.io/docs/latest/graphql/core/migrations/advanced/auto-apply-migrations.html
      HASURA_GRAPHQL_MIGRATIONS_DIR: /hasura-migrations
      HASURA_GRAPHQL_METADATA_DIR: /hasura-metadata
      HASURA_GRAPHQL_DATABASE_URL: postgres://postgres:${ENVIO_POSTGRES_PASSWORD:-testing}@envio-postgres:5432/envio-dev
      HASURA_GRAPHQL_ENABLE_CONSOLE: ${HASURA_GRAPHQL_ENABLE_CONSOLE:-true} # can make this default to false once we are further in our development.
      HASURA_GRAPHQL_ENABLED_LOG_TYPES:
        startup, http-log, webhook-log, websocket-log,
        query-log
      HASURA_GRAPHQL_NO_OF_RETRIES: 10
      HASURA_GRAPHQL_ADMIN_SECRET: ${HASURA_GRAPHQL_ADMIN_SECRET:-testing}
      HASURA_GRAPHQL_STRINGIFY_NUMERIC_TYPES: "true"
      PORT: 8080
      HASURA_GRAPHQL_UNAUTHORIZED_ROLE: public
    healthcheck:
      # CMD from a GH issue thread, no curl or wget installed with image
      # but hasura comes with a /healthz public endpoint for checking server health
      test: timeout 1s bash -c ':> /dev/tcp/127.0.0.1/8080' || exit 1
      interval: 5s
      timeout: 2s
      retries: 50
      start_period: 5s
    networks:
      - my-proxy-net
volumes:
  db_data:
  ganache-data:
networks:
  my-proxy-net:
    name: local_test_network

```

### Starting the indexer:
```
pnpm dev
```
Open Hasura:
```
open http://localhost:8080
```
(or load http://localhost:8080 in your browser)

### Deploying to Envio Hosted Service:
https://docs.envio.dev/docs/HyperIndex/hosted-service-deployment

----
----

# The App
The "App" is two apps:
- Core (/apps/core) - The Frontend
- Worker (/apps/worker) - A Background worker that keeps an in-memory Redis database up-to-date with Mira pools and their trades as new contract events flow into Envio/Hasura

## Core & Worker Setup:
Set envs in (/apps/core/.env):
```

GRAPHQL_URL="<The graphql endpoint for local/hosted Envio Hasura>"
#http://localhost:8080/v1/graphql

GRAPHQL_WS_URL="<The graphql ws endpoint for local/hosted Envio Hasura>"
#You can use the same as GRAPHQL_URL as http(s) will be replaced with ws(s) automatically
#http://localhost:8080/v1/graphql

PUBLIC_RPC_URL="<Ethereum L1 Mainnet RPC>"
#Used to fetch the price of ETH

PUBLIC_FUEL_RPC_URL="https://mainnet.fuel.network/v1/graphql"

REDISCLOUD_URL="<Connection URL to a redis instance>"

HASURA_ADMIN_SECRET="<Set your admin secret to access Hasura, whatever you like>"

```

Copy the same .env to /apps/worker

---

# Running
## Run Envio
In Terminal 1:
```
cd envio
pnpm dev
```

## Run Core/Worker apps:
In Terminal 2:
```
#from root
pnpm dev
```

---

We're building interesting and novel emerging technology [@Props](https://x.com/props). Join our [Discord](https://discord.props.app) and nerd out.