
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
    console.log('getTradingData', pool_id, offset, limit);
    const response = await fetch(`/api/trades?pool_id=${pool_id}&offset=${offset}&limit=${limit}`);
    const data = await response.json();
    console.log('getTradingData data', data);
    return data;
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
