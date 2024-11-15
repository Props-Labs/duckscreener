import { json } from '@sveltejs/kit';
import { addChatMessage, getChatData } from '$lib/services/chat.server';

export async function POST({ request }) {
    try {
        const { poolId, account, message } = await request.json();
        
        if (!poolId || !account || !message) {
            return json({ error: 'Missing required fields' }, { status: 400 });
        }

        const chatMessage = await addChatMessage(poolId, account, message);
        return json(chatMessage);
    } catch (error) {
        console.error('Error in POST /api/chat:', error);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function GET({ url }) {
    try {
        const poolId = url.searchParams.get('poolId');
        const offset = parseInt(url.searchParams.get('offset') || '0');
        const limit = parseInt(url.searchParams.get('limit') || '50');

        if (!poolId) {
            return json({ error: 'Missing poolId' }, { status: 400 });
        }

        const messages = await getChatData(poolId, offset, limit);
        return json(messages);
    } catch (error) {
        console.error('Error in GET /api/chat:', error);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
}