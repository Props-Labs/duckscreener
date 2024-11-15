export async function fetchChatMessages(poolId: string, offset = 0, limit = 50) {
    const response = await fetch(`/api/chat?poolId=${poolId}&offset=${offset}&limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch chat messages');
    return response.json();
}

export async function sendChatMessage(poolId: string, account: string, message: string) {
    const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ poolId, account, message }),
    });
    if (!response.ok) throw new Error('Failed to send chat message');
    return response.json();
} 