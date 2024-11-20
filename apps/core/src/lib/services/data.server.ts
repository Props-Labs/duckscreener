import { env } from '$env/dynamic/private';
import { getValue, storeValue } from './redis';
import type { TradingPair } from './pairs';
import * as cheerio from 'cheerio'
import {getPriceData} from './blockchain';

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

export const scrapeAssetPrice = async (asset_address: string) => {

    console.log("scrapeAssetPrice::", asset_address);

    try{
        const cachedData = await getValue(`price_${asset_address}`);
        console.log('cachedData::', cachedData);
        if(cachedData){
            console.log('Returning cached data');
            const data = JSON.parse(cachedData);
            console.log('cached data length', data.length);
            return JSON.parse(cachedData);
        }
    }
    catch(error){}

    console.log("Fetching asset price");
    //No cached data, fetch
    const fuel_assets = await getValue(`fuel_assets`);
    const fuel_asset_data = JSON.parse(fuel_assets);
    const token = fuel_asset_data.find((asset: any) => 
        asset.networks.some((network: any) => 
            network.type === 'fuel' && network.assetId === asset_address
        )
    );

    console.log('token::', token);

    if(token.name === 'Ethereum'){
        const ethPrice = await getPriceData("0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419")
        return {priceUSD: Number(ethPrice.formattedPrice)};
    }
    // Get the Ethereum address from the token's Ethereum network entry
    const ethereumNetwork = token?.networks.find((network: any) => 
        network.type === 'ethereum' && network.chainId === 1
    );
    const address = ethereumNetwork?.address;

    console.log('eth asset address::', address);

    try {
        let response = await fetch(`https://www.coingecko.com/en/coins/${address}`)
        let html = await response.text()
        let $ = cheerio.load(html)
        let priceText = $('span[data-converter-target="price"]').first().text()
        console.log('Price', priceText)

        if(!priceText){
            let formattedName;
            if(token.name === 'SolvBTC.BBN'){
                formattedName = 'solv-protocol-solvbtc-bbn'
            }
            else{
                formattedName = token.name.replace(/ /g, '-').toLowerCase();
            }
            
            response = await fetch(`https://www.coingecko.com/en/coins/${formattedName}`)
            html = await response.text()
            $ = cheerio.load(html)
            priceText = $('span[data-converter-target="price"]').first().text()
            console.log('Price2', priceText)
        }
        const convertedPrice = parseFloat(priceText.replace(/[$,]/g, ''))  // Remove both $ and commas
        await storeValue(`price_${asset_address}`, JSON.stringify({priceUSD: convertedPrice}), 10); // 10 sec cache
        return {priceUSD: convertedPrice};
    } catch (error) {
        console.error('Error fetching pairs:', error);
        return { error: 'Failed to fetch asset price', token };
    }
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

export async function getAllPairs(): Promise<TradingPair[]> {
    const query = `
        query GetPools {
            pools: MiraV1Core_CreatePoolEvent {
                pool_id
                decimals_0
                decimals_1
                time
                block_height
            }
            tokens: MiraV1Core_SetSymbolEvent {
                asset
                symbol
            }
        }
    `;

    try {
        const response = await queryDB(query, {});
        
        if (!response?.data?.pools) {
            console.error('Invalid response format:', response);
            throw new Error('Invalid response format from GraphQL');
        }

        const pools = response.data.pools;
        const tokens = response.data.tokens || [];
        
        // Create a map of token addresses to their symbols
        const tokenSymbols = new Map<string, string>();
        tokens.forEach((token: any) => {
            if (token.asset && token.symbol) {
                tokenSymbols.set(token.asset, token.symbol);
            }
        });

        console.log('Fetched pools:', pools.length);
        
        return pools.map((pool: any) => {
            // Extract token addresses from pool_id
            // pool_id format is "token0_address_token1_address_isStable"
            const [token0Address, token1Address, isStableStr] = pool.pool_id.split('_');
            
            return {
                id: pool.pool_id,
                token0Symbol: tokenSymbols.get(token0Address) || 'Unknown',
                token1Symbol: tokenSymbols.get(token1Address) || 'Unknown',
                token0Address,
                token1Address,
                isStable: isStableStr === 'true',
                reserve0: '0', // We'll need to fetch these from contract calls
                reserve1: '0', // We'll need to fetch these from contract calls
                decimals0: pool.decimals_0,
                decimals1: pool.decimals_1,
                volume24h: '0', // TODO: Calculate from SwapEvents
                tvl: '0'  // TODO: Calculate from reserves and token prices
            };
        });
    } catch (error) {
        console.error('Error fetching pairs:', error);
        throw error;
    }
}