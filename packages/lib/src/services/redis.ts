import { createClient } from 'redis';
import { config } from '../config';

let redisClient: ReturnType<typeof createClient> | null = null;

export async function getRedisClient() {
    if (!redisClient) {
        redisClient = createClient({
            url: config.redis.url,
        });
        await redisClient.connect();
    }
    return redisClient;
}

export async function getValue(key: string): Promise<string | null> {
    const client = await getRedisClient();
    return client.get(`${config.redis.prefix}${key}`);
}

export async function setValue(key: string, value: string, ttl?: number): Promise<void> {
    const client = await getRedisClient();
    const prefixedKey = `${config.redis.prefix}${key}`;
    if (ttl) {
        await client.setEx(prefixedKey, ttl, value);
    } else {
        await client.set(prefixedKey, value);
    }
} 