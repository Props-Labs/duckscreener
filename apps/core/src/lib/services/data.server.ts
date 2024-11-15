import { env } from '$env/dynamic/private';
import { getValue, storeValue } from './redis';
interface SwapEvent {
    exchange_rate: string;
    time: number;
    // ... other fields
}

interface CandleStick {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
}

export type TimeFrame = '1s' | '1m' | '5m' | '15m' | '30m' | '1h' | '2h' | '4h' | '6h' | '12h' | '24h';

// Convert timeframe to seconds
export function timeFrameToSeconds(timeFrame: TimeFrame): number {
    const timeFrameMap: Record<TimeFrame, number> = {
        '1s': 1,
        '1m': 60,
        '5m': 300,
        '15m': 900,
        '30m': 1800,
        '1h': 3600,
        '2h': 7200,
        '4h': 14400,
        '6h': 21600,
        '12h': 43200,
        '24h': 86400
    };
    return timeFrameMap[timeFrame];
}

export const getTradingData = async (pool_id: string, offset: number = 0, limit: number = 1000) => {
    
    try{
        const cachedData = await getValue(`trades_${pool_id}`);
        if(cachedData){
            console.log('Returning cached data');
            const data = JSON.parse(cachedData);
            console.log('cached data length', data.length);
            return JSON.parse(cachedData);
        }
    }
    catch(error){}

    const allResults = [];
   
    let currentOffset = offset || 0;
    let hasMore = true;
    
    while (hasMore) {
       
        const query = `
           query MyQuery($pool_id: String = "0x86fa05e9fef64f76fa61c03f5906c87a03cb9148120b6171910566173d36fc9e_0xf8f8b6283d7fa5b672b530cbb84fcccb4ff8dc40f8176ef4544ddb1f1952ad07_false", $offset: Int = 0, $limit: Int = 1000) {
                MiraV1Core_SwapEvent(offset: $offset, where: {pool_id: {_eq: $pool_id}}, limit: $limit, order_by: {time: desc}) {
                    asset_0_in
                    asset_0_out
                    asset_1_in
                    asset_1_out
                    block_height
                    db_write_timestamp
                    exchange_rate
                    id
                    is_buy
                    is_sell
                    pool_id
                    recipient
                    time
                    transaction_id
                }
            }
        `;

       
        const variables = {
            pool_id,
            offset: parseInt(currentOffset),
            limit: limit || 1000 // Keep at 1000 as this is the max supported
        };

       

        try {
            const response = await queryDB(query, variables);
            const results = response.data.MiraV1Core_SwapEvent;
            
            if (results && results.length > 0) {
                allResults.push(...results);
                currentOffset = parseInt(currentOffset) + Number(results.length);
                
                
                // If we got less than 1000 results, we've reached the end
                if (results.length < 1000) {
                    hasMore = false;
                }
            } else {
                hasMore = false;
            }
            
            // Optional: Add a small delay to prevent overwhelming the API
            await new Promise(resolve => setTimeout(resolve, 100));
            
        } catch (error) {
            
            hasMore = false; // Stop on error
        }
    }

   
    await storeValue(`trades_${pool_id}`, JSON.stringify(allResults), 5); // 5 sec cache
    return allResults;
}

export async function convertTradingDataToChartData(data: SwapEvent[], timeFrame: TimeFrame = '1s'): Promise<CandleStick[]> {
    if (!data.length) return [];

    const sortedData = [...data].sort((a, b) => a.time - b.time);
    const intervalSeconds = timeFrameToSeconds(timeFrame);
    
    // Group data by time intervals
    const groupedData: { [key: number]: SwapEvent[] } = {};
    
    sortedData.forEach(event => {
        // Round down to nearest interval
        const periodStart = Math.floor(event.time / intervalSeconds) * intervalSeconds;
        
        if (!groupedData[periodStart]) {
            groupedData[periodStart] = [];
        }
        groupedData[periodStart].push(event);
    });

    // Convert to candlesticks
    return Object.entries(groupedData).map(([time, events]) => {
        const rates = events.map(e => Number(e.exchange_rate) / 1e18);
        return {
            time: parseInt(time),
            open: rates[0],
            high: Math.max(...rates),
            low: Math.min(...rates),
            close: rates[rates.length - 1]
        };
    }).sort((a, b) => a.time - b.time);
}

export async function getAllLPs() {
    const query = `
        query MyQuery {
            MiraV1Core_CreatePoolEvent {
                pool_id
            }
        }
    `;

    const response = await queryDB(query, {});
    return response.data.MiraV1Core_CreatePoolEvent;
}

export async function queryDB(query: string, variables: any) {

    if(!env.GRAPHQL_URL) {
        throw new Error('GRAPHQL_URL is not set');
    }

    const response = await fetch(env.GRAPHQL_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            query,
            variables,
          }),
    });

    const data = await response.json();

    return data;

  }