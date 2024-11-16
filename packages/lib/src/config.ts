export const config = {
    redis: {
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        prefix: 'duckscreener:',
        ttl: 5 * 60, // 5 minutes default TTL
    },
    graphql: {
        url: process.env.PUBLIC_GRAPHQL_URL || 'https://beta-4.fuel.network/graphql',
        wsUrl: process.env.PUBLIC_GRAPHQL_URL?.replace('https', 'wss') || 'wss://beta-4.fuel.network/graphql',
    }
}; 