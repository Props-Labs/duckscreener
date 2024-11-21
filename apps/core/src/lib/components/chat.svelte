<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { selectedPool, showWalletModal } from '$lib/stores';
    import { browser } from '$app/environment';
    import { account, connected, connect, disconnect } from "svelte-fuels";
    import { fetchChatMessages, sendChatMessage } from '$lib/services/chat';
    import { ga } from '@beyonk/svelte-google-analytics';
    export let poolId: string;
    

    interface ChatMessage {
        id: string;
        poolId: string;
        account: string;
        message: string;
        timestamp: number;
    }

    let messages: ChatMessage[] = [];
    let newMessage = '';
    let messagesContainer: HTMLDivElement;
    let isLoading = false;
    let autoScrollToBottom = true;
    let pollInterval: NodeJS.Timeout | null = null;

    async function loadMessages() {
        if (!poolId) return;
        
        try {
            isLoading = true;
            const fetchedMessages = await fetchChatMessages(poolId);
            messages = fetchedMessages.sort((a, b) => a.timestamp - b.timestamp);
            
            if (autoScrollToBottom) {
                setTimeout(() => {
                    scrollToBottom();
                    autoScrollToBottom = false;
                }, 100);
            }
        } catch (error) {
            console.error('Failed to load messages:', error);
        } finally {
            isLoading = false;
        }
    }

    function startPolling() {
        stopPolling(); // Clear any existing interval first
        
        pollInterval = setInterval(async () => {
            if (!poolId) return;
            
            try {
                const latestMessages = await fetchChatMessages(poolId);
                const sortedMessages = latestMessages.sort((a, b) => a.timestamp - b.timestamp);
                
                if (sortedMessages.length > messages.length) {
                    const wasAtBottom = isAtBottom();
                    messages = sortedMessages;
                    if (wasAtBottom) {
                        scrollToBottom();
                    }
                }
            } catch (error) {
                console.error('Failed to load messages:', error);
            }
        }, 5000) as unknown as NodeJS.Timeout;
    }

    function stopPolling() {
        if (pollInterval) {
            clearInterval(pollInterval);
            pollInterval = null;
        }
    }

    // Watch for poolId changes
    $: if (poolId) {
        loadMessages();
        startPolling();
    }

    onMount(() => {
        if (poolId) {
            loadMessages();
            startPolling();
        }
    });

    onDestroy(() => {
        stopPolling();
    });

    function isAtBottom(): boolean {
        if (!messagesContainer) return false;
        const threshold = 50;
        return (
            messagesContainer.scrollHeight - messagesContainer.scrollTop - messagesContainer.clientHeight 
            <= threshold
        );
    }

    function scrollToBottom() {
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }

    async function handleSubmit() {
        if (!newMessage.trim() || !$account || !$selectedPool) return;
        
        try {
            const response = await sendChatMessage(
                $selectedPool,
                $account,
                newMessage.trim()
            );

            messages = [...messages, response].sort((a, b) => a.timestamp - b.timestamp);
            newMessage = '';
            
            setTimeout(scrollToBottom, 0);

            ga.addEvent('chat_message', {
                pool_name: $selectedPool?.lpName,
                pool_id: $selectedPool?.id,
                token0: $selectedPool?.token0Name,
                token1: $selectedPool?.token1Name,
            });
            
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    }

    function handleKeyPress(event: KeyboardEvent) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSubmit();
        }
    }

    function formatTime(timestamp: number): string {
        return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();
</script>

<div class="flex flex-col h-full">
    <div class="px-4 py-2 bg-[#1e222d] text-[#d1d4dc] text-[10px] opacity-60 text-center border-b border-[#2B2B43]">
        *chat messages auto-delete after 36 hours
    </div>

    <div class="p-4 border-b border-[#2B2B43] flex justify-between items-center">
        <div class="flex items-center gap-4">
            <h2 class="text-[#d1d4dc] font-semibold">Chat</h2>
            
            {#if browser}
                {#if $connected && $account}
                <button
                    on:click={() => disconnect()}
                    class="px-3 py-1.5 text-sm bg-[#26a69a] text-white rounded hover:bg-[#ff0000] transition-colors flex items-center gap-2"
                >
                    {$account.slice(0, 6)}...{$account.slice(-4)}
                </button>
                {:else}
                <button
                    on:click={() => connect()}
                    class="px-3 py-1.5 text-sm bg-[#26a69a] text-white rounded hover:bg-[#2196f3] transition-colors flex items-center gap-2"
                >
                    Connect Wallet
                </button>
                {/if}
            {/if}
        </div>
        
        <button 
            class="sm:hidden text-[#d1d4dc] hover:text-[#26a69a] transition-colors"
            on:click={() => dispatch('close')}
        >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
    </div>
    
    <!-- Messages area -->
    <div 
        bind:this={messagesContainer}
        class="flex-1 overflow-y-auto p-4 space-y-4"
    >
        {#if isLoading}
            <div class="text-center text-[#d1d4dc] opacity-60">
                Loading messages...
            </div>
        {:else}
            {#each messages as message (message.id)}
                <div class="animate-slide-in {message.account === $account ? 'flex justify-end' : ''}">
                    <div class="flex flex-col message-bubble">
                        <div class="flex items-center space-x-2 {message.account === $account ? 'justify-end' : ''}">
                            <span class="text-[#26a69a] text-xs font-medium">
                                {message.account.slice(0, 6)}...{message.account.slice(-4)}
                            </span>
                            <span class="text-[#d1d4dc] opacity-50 text-[10px]">
                                {formatTime(message.timestamp)}
                            </span>
                        </div>
                        <div class="mt-1 break-words text-sm {message.account === $account ? 
                            'message-bubble-self' : 
                            'message-bubble-other'} 
                            px-3 py-1.5"
                        >
                            {message.message}
                        </div>
                    </div>
                </div>
            {/each}
        {/if}
    </div>
    
    <!-- Input area -->
    <div class="p-4 border-t border-[#2B2B43]">
        <div class="flex flex-col sm:flex-row gap-2">
            <input 
                type="text" 
                bind:value={newMessage}
                on:keypress={handleKeyPress}
                placeholder="Type a message..." 
                class="flex-1 bg-[#2B2B43] text-[#d1d4dc] rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#26a69a] placeholder-[#d1d4dc]/50"
                disabled={!$connected}
            >
            {#if $connected && $account}
                <button 
                    on:click={handleSubmit}
                    disabled={!newMessage.trim()}
                    class="w-full sm:w-auto bg-[#26a69a] text-white px-4 py-2 rounded hover:bg-[#2196f3] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Send
                </button>
            {:else}
                <button 
                    on:click={() => connect()}
                    class="w-full sm:w-auto bg-[#26a69a] text-white px-4 py-2 rounded hover:bg-[#2196f3] transition-colors"
                >
                    Connect
                </button>
            {/if}
        </div>
    </div>
</div>

<style>
    .animate-slide-in {
        animation: slideInOther 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .animate-slide-in.flex.justify-end {
        animation: slideInSelf 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes slideInSelf {
        from {
            opacity: 0;
            transform: translateX(50px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }

    @keyframes slideInOther {
        from {
            opacity: 0;
            transform: translateX(-50px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }

    .system-message {
        animation: fadeIn 0.3s ease-out;
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }

    /* Add these new styles for mobile optimization */
    @media (max-width: 640px) {
        .flex-1 {
            height: calc(100vh - 8rem); /* Adjust for header and input area */
        }
    }

    /* Add styles for the loading spinner */
    @keyframes spin {
        to { transform: rotate(360deg); }
    }

    .animate-spin {
        animation: spin 1s linear infinite;
    }

    /* Chat bubble styles */
    .message-bubble {
        max-width: 80%;
    }

    .message-bubble-self {
        background-color: #2196f3;
        color: white;
        border-radius: 0.5rem 0.5rem 0 0.5rem;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        transform-origin: right;
    }

    .message-bubble-other {
        background-color: #2B2B43;
        color: #d1d4dc;
        border-radius: 0.5rem 0.5rem 0.5rem 0;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        transform-origin: left;
    }
</style> 