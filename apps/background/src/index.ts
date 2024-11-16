import { PoolSyncService } from './services/pool-sync';
import { startPoolSubscriber } from './services/pool-subscriber';
import { getRedisClient } from './services/redis';

async function main() {
    try {
        // Initialize Redis
        await getRedisClient();
        
        // Start pool sync service
        const syncService = new PoolSyncService();
        await syncService.start();
        
        // Start subscription for new pools
        await startPoolSubscriber();
        
        console.log('Background service started successfully');

        // Handle shutdown
        process.on('SIGTERM', async () => {
            console.log('Received SIGTERM, shutting down...');
            await syncService.stop();
            const redis = await getRedisClient();
            await redis.cleanup();
            process.exit(0);
        });

    } catch (error) {
        console.error('Failed to start background service:', error);
        process.exit(1);
    }
}

main(); 