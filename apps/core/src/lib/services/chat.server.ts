import { env } from '$env/dynamic/private';
import { redis, getValue, storeValue } from './redis';

interface ChatMessage {
    id: string;
    poolId: string;
    account: string;
    message: string;
    timestamp: number;
}

const CHAT_EXPIRY = 36 * 60 * 60; // 36 hours in seconds
const CHAT_PREFIX = 'chat:';
const CHAT_INDEX_PREFIX = 'chat_index:';

export const addChatMessage = async (poolId: string, account: string, message: string) => {
    try {
        const timestamp = Date.now();
        const messageId = `${CHAT_PREFIX}${poolId}:${timestamp}:${crypto.randomUUID()}`;
        
        // Create the message object
        const chatMessage: ChatMessage = {
            id: messageId,
            poolId,
            account,
            message,
            timestamp
        };

        // Store the message with expiry
        await storeValue(messageId, JSON.stringify(chatMessage), CHAT_EXPIRY);

        // Add to the pool's message index (sorted set)
        const indexKey = `${CHAT_INDEX_PREFIX}${poolId}`;
        await redis.zadd(indexKey, timestamp, messageId);
        
        // Set expiry on the index as well
        await redis.expire(indexKey, CHAT_EXPIRY);

        return chatMessage;
    } catch (error) {
        console.error('Error adding chat message:', error);
        throw error;
    }
};

export const getChatData = async (poolId: string, offset: number = 0, limit: number = 50) => {
    try {
        const indexKey = `${CHAT_INDEX_PREFIX}${poolId}`;
        
        // Get message IDs from the sorted set (oldest first)
        const messageIds = await redis.zrange(indexKey, offset, offset + limit - 1);
        
        if (!messageIds.length) {
            return [];
        }

        // Get all messages in parallel
        const messagePromises = messageIds.map(async (messageId: string) => {
            const messageJson = await getValue(messageId);
            if (!messageJson) return null;
            return JSON.parse(messageJson) as ChatMessage;
        });

        const messages = await Promise.all(messagePromises);
        
        // Filter out any null messages (in case some expired)
        return messages.filter((msg): msg is ChatMessage => msg !== null);
    } catch (error) {
        console.error('Error getting chat data:', error);
        throw error;
    }
};

// Optional: Clean up old messages (could be run periodically)
export const cleanupOldMessages = async (poolId: string) => {
    try {
        const indexKey = `${CHAT_INDEX_PREFIX}${poolId}`;
        const minScore = Date.now() - (CHAT_EXPIRY * 1000);
        
        // Get old message IDs
        const oldMessageIds = await redis.zrangebyscore(indexKey, 0, minScore);
        
        if (oldMessageIds.length > 0) {
            // Remove from index
            await redis.zremrangebyscore(indexKey, 0, minScore);
            
            // Delete the actual messages
            await Promise.all(oldMessageIds.map(messageId => redis.del(messageId)));
        }
    } catch (error) {
        console.error('Error cleaning up old messages:', error);
        throw error;
    }
};
