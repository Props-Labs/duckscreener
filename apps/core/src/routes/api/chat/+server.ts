import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { addChatMessage, getChatData } from '$lib/services/chat.server';

export const GET: RequestHandler = async ({ url }) => {
    const poolId = url.searchParams.get('poolId');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const limit = parseInt(url.searchParams.get('limit') || '50');

    if (!poolId) {
        return json({ error: 'Pool ID is required' }, { status: 400 });
    }

    try {
        const messages = await getChatData(poolId, offset, limit);
        return json(messages);
    } catch (error) {
        console.error('Error fetching chat messages:', error);
        return json({ error: 'Failed to fetch messages' }, { status: 500 });
    }
};

export const POST: RequestHandler = async ({ request }) => {
    const { poolId, account, message } = await request.json();

    console.log("adding chat message", poolId, account, message);

    console.log('POST /api/chat', poolId, account, message);
    if (!poolId || !account || !message) {
        return json({ error: 'Missing required fields' }, { status: 400 });
    }

    try {
        const chatMessage = await addChatMessage(poolId, account, message);
        return json(chatMessage);
    } catch (error) {
        console.error('Error adding chat message:', error);
        return json({ error: 'Failed to add message' }, { status: 500 });
    }
};