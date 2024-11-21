import 'dotenv/config';
import { createClient } from 'graphql-ws';
import { WebSocket } from 'ws';

// Create the client after dynamic import
let graphQLClient: any = null;

// Initialize the GraphQL client
const initGraphQLClient = async () => {
  //@ts-ignore
  const GraphQL = await import('graphql-request');
  graphQLClient = new GraphQL.GraphQLClient(process.env.GRAPHQL_WS_URL, {
    // headers: {
    //   'x-hasura-admin-secret': process.env.HASURA_ADMIN_SECRET
    // }
  });
};

// Initialize client immediately
initGraphQLClient();

export const wsClient = createClient({
  //@ts-ignore
  url: process.env.GRAPHQL_WS_URL,
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
    if (!graphQLClient) {
        await initGraphQLClient();
    }
    return await graphQLClient.request(query, variables);
}