import { config } from '../config';
import {  updateAllPools } from './pool-catalog';

export class PoolSyncService {
    private syncInterval: NodeJS.Timeout | null = null;

    async start() {
        console.log('Starting pool sync service...');
        
        // Initial sync
        await this.syncPools();
        
        // Setup interval for regular syncs
        this.syncInterval = setInterval(
            () => this.syncPools(),
            config.sync.interval
        );
    }

    async stop() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
    }

    private async syncPools() {
        try {
            console.log('Starting pool sync...');
            const startTime = Date.now();
            
            await updateAllPools();
            
            console.log(`Pool sync completed in ${Date.now() - startTime}ms`);
        } catch (error) {
            console.error('Error during pool sync:', error);
        }
    }
} 