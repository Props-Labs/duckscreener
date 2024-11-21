import 'dotenv/config'; 
import * as GraphQL from 'graphql-request';
import { createClient } from 'graphql-ws';
import WebSocket from 'ws';
import { config } from '../config';

export const graphQLClient = new GraphQL.GraphQLClient(config.graphql.url, {
  // headers: {
  // 	'x-hasura-admin-secret': process.env.HASURA_ADMIN_SECRET
  // }
});

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
  return await graphQLClient.request(query, variables);
}