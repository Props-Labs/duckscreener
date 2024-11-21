import { json } from '@sveltejs/kit';
import { getAllPairs } from '$lib/services/data.server';

export async function GET() {
    try {
        const pairs = await getAllPairs();
        return json(pairs);
    } catch (error) {
        console.error('Error fetching pairs:', error);
        return json({ error: 'Failed to fetch pairs::' }, { status: 500 });
    }
} 