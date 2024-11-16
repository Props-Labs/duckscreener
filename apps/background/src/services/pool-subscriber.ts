import { subscribeToQuery } from './data';
import { updatePoolCatalog } from './pool-catalog';

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

        subscribeToQuery(poolSubscription, async(event: any) => {
            const data = event.MiraV1Core_CreatePoolEvent;
            console.log('MiraV1Core_CreatePoolEvent', data)
            for(const pool of data) {
                console.log('New pool created:', pool.pool_id);
                
                await updatePoolCatalog(pool);
            }
        });
        

        console.log('Pool subscriber started successfully');
    } catch (error) {
        console.error('Failed to start pool subscriber:', error);
        throw error;
    }
} 