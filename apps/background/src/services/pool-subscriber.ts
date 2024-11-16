import { createClient } from 'graphql-ws';
import WebSocket from 'ws';
import { updatePoolCatalog } from './pool-catalog';

const GRAPHQL_WS_URL = process.env.PUBLIC_GRAPHQL_URL?.replace('https', 'wss') || '';

const wsClient = createClient({
    url: GRAPHQL_WS_URL,
    webSocketImpl: WebSocket,
});

const poolSubscription = `
    subscription OnCreatePool {
        MiraV1Core_CreatePoolEvent {
            pool_id
            block_height
            time
        }
    }
`;

export async function startPoolSubscriber() {
    console.log('Starting pool subscriber...');
    
    try {
        await wsClient.subscribe(
            {
                query: poolSubscription,
            },
            {
                next: async (data: any) => {
                    const pool = data.data.MiraV1Core_CreatePoolEvent;
                    console.log('New pool created:', pool.pool_id);
                    
                    await updatePoolCatalog(
                        pool.pool_id,
                        pool.block_height,
                        new Date(pool.time).getTime()
                    );
                },
                error: (error) => {
                    console.error('Subscription error:', error);
                },
                complete: () => {
                    console.log('Subscription completed');
                },
            },
        );

        console.log('Pool subscriber started successfully');
    } catch (error) {
        console.error('Failed to start pool subscriber:', error);
        throw error;
    }
} 