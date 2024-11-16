import { createClient } from 'redis';
import { config } from '../config';

class RedisService {
    private static instance: RedisService;
    private client: ReturnType<typeof createClient>;

    private constructor() {
        this.client = createClient({
            url: config.redis.url
        });

        this.client.on('error', (err) => console.error('Redis Client Error', err));
        this.client.on('connect', () => console.log('Redis Client Connected'));
    }

    static async getInstance(): Promise<RedisService> {
        if (!RedisService.instance) {
            RedisService.instance = new RedisService();
            await RedisService.instance.client.connect();
        }
        return RedisService.instance;
    }

    async get(key: string): Promise<string | null> {
        return await this.client.get(config.redis.prefix + key);
    }

    async set(key: string, value: string, ttl?: number): Promise<void> {
        const options = ttl ? { EX: ttl } : undefined;
        await this.client.set(config.redis.prefix + key, value, options);
    }

    async cleanup(): Promise<void> {
        await this.client.quit();
    }
}

export const getRedisClient = RedisService.getInstance; 