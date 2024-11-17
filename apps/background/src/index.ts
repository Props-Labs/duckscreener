import { PoolSyncService } from './services/pool-sync';
import { startPoolSubscriber } from './services/pool-subscriber';
import { redis } from './services/redis';

async function main() {
    try {
       
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
            await redis.cleanup();
            process.exit(0);
        });

    } catch (error) {
        console.error('Failed to start background service:', error);
        process.exit(1);
    }
}

main(); 