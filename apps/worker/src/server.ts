import throng from "throng";
import { PoolSyncService } from './services/pool-sync';
import { startPoolSubscriber } from './services/pool-subscriber';
import { loadAssetData } from './services/assets';
import { redis } from './services/redis';

const start = async (id: number) => {
  try {
    console.log(`Worker ${id} starting...`);
    await loadAssetData();
    
    // Start pool sync service
    const syncService = new PoolSyncService();
    await syncService.start();
    
    // Start subscription for new pools
    await startPoolSubscriber();
    
    console.log(`Worker ${id} started successfully`);

    // Handle shutdown
    process.on('SIGTERM', async () => {
      console.log(`Worker ${id} received SIGTERM, shutting down...`);
      await syncService.stop();
      await redis.cleanup();
      process.exit(0);
    });

  } catch (error) {
    console.error(`Worker ${id} failed to start:`, error);
    process.exit(1);
  }
};

const workers = parseInt(process.env.WEB_CONCURRENCY || '1', 10);
throng({ workers, start });