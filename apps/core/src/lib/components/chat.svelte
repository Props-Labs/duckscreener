<script lang="ts">
    import { onMount } from 'svelte';
    import { showWalletModal } from '$lib/stores';
    import { browser } from '$app/environment';
    import { account, connected,connect, disconnect, connectors, FuelConnector } from "svelte-fuels";


    interface ChatMessage {
        id: string;
        user: string;
        message: string;
        timestamp: Date;
        isSystem?: boolean;
    }

    let messages: ChatMessage[] = [];
    let newMessage = '';
    let messagesContainer: HTMLDivElement;
   

    function scrollToBottom() {
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }

    function handleSubmit() {
        if (!newMessage.trim()) return;
        
        const message: ChatMessage = {
            id: crypto.randomUUID(),
            user: $account ? $account.slice(0, 6) + '...' + $account.slice(-4) : 'Anonymous',
            message: newMessage.trim(),
            timestamp: new Date()
        };
        
        messages = [...messages, message];
        newMessage = '';
        
        // Scroll to bottom on next tick
        setTimeout(scrollToBottom, 0);
    }

    function handleKeyPress(event: KeyboardEvent) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSubmit();
        }
    }

    function formatTime(date: Date): string {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    function handleConnectWallet() {
        showWalletModal.set(true);
    }
</script>

<div class="flex flex-col h-full">
    <div class="p-4 border-b border-[#2B2B43] flex justify-between items-center">
        <div class="flex items-center gap-4">
            <h2 class="text-[#d1d4dc] font-semibold">Psycho Chat</h2>
            
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
        
        <!-- Close button only shows on mobile -->
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
        {#each messages as message (message.id)}
            <div 
                class="animate-slide-in"
                class:system-message={message.isSystem}
            >
                {#if message.isSystem}
                    <div class="text-[#26a69a] text-xs opacity-75 text-center py-2">
                        {message.message}
                    </div>
                {:else}
                    <div class="flex flex-col">
                        <div class="flex items-center space-x-2">
                            <span class="text-[#26a69a] text-sm font-medium">{message.user}</span>
                            <span class="text-[#d1d4dc] opacity-50 text-xs">{formatTime(message.timestamp)}</span>
                        </div>
                        <div class="mt-1 text-[#d1d4dc] break-words">
                            {message.message}
                        </div>
                    </div>
                {/if}
            </div>
        {/each}
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
                    class="w-full sm:w-auto bg-[#26a69a] text-white px-4 py-2 rounded hover:bg-[#2196f3] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Connect
                </button>
            {/if}
        </div>
    </div>
</div>

<style>
    .animate-slide-in {
        animation: slideIn 0.2s ease-out;
    }

    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
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
</style> 