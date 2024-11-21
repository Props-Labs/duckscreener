import { json } from '@sveltejs/kit';
import { scrapeAssetPrice} from '$lib/services/data.server';

export async function GET({request, params}) {
    const address = params.address;
    try {
        const response = await scrapeAssetPrice(address);
        return json(response);
    } catch (error) {
        console.error('Error fetching pairs:', error);
        return json({ error: 'Failed to fetch pairs: price' }, { status: 500 });
    }
} 