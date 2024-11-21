import 'dotenv/config';

export const config = {
    redis: {
        url: process.env.REDISCLOUD_URL || 'redis://localhost:6379',
        prefix: 'duckscreener:',
        ttl: 5 * 60, // 5 minutes default TTL
    },
    graphql: {
        url: process.env.GRAPHQL_URL || 'https://beta-4.fuel.network/graphql',
        wsUrl: process.env.GRAPHQL_URL?.replace('https', 'wss') || 'wss://beta-4.fuel.network/graphql',
    },
    sync: {
        interval: parseInt(process.env.SYNC_INTERVAL || '300000'), // 5 minutes
        batchSize: parseInt(process.env.SYNC_BATCH_SIZE || '50'),
    }
}; 