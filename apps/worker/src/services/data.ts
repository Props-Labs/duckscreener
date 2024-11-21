import 'dotenv/config';
import { createClient } from 'graphql-ws';
import WebSocket from 'ws';
import { config } from '../config';

let graphQLClient: any = null;

async function getGraphQLClient() {
  if (!graphQLClient) {
    const { GraphQLClient } = await import('graphql-request');
    graphQLClient = new GraphQLClient(config.graphql.url, {
      // headers: {
      // 	'x-hasura-admin-secret': process.env.HASURA_ADMIN_SECRET
      // }
    });
  }
  return graphQLClient;
}

export const wsClient = createClient({
  url: config.graphql.wsUrl,
  webSocketImpl: WebSocket,
  connectionParams: {
    // headers: {
    //   'x-hasura-admin-secret': process.env.HASURA_ADMIN_SECRET
    // }
  },
});

export function subscribeToQuery(query: string, callback: (data: any) => void) {
  (async () => {
    const onNext = (response: any) => {
      callback(response.data);
    };

    await new Promise((resolve, reject) => {
      wsClient.subscribe(
        { query },
        {
          next: onNext,
          error: reject,
          complete: () => resolve(undefined),
        },
      );
    });
  })();
}

export async function queryDB(query: string, variables: any) {
  const client = await getGraphQLClient();
  try{
    return await client.request(query, variables);
  }
  catch(e){
    console.log(e);
  }
  
}