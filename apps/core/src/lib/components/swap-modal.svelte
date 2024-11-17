<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { account, connect, connected, wallet } from "svelte-fuels";
    import { previewSwap, executeSwap, createPoolId } from '$lib/services/swap';
    import { getBalances } from '$lib/services/token';
    import { onMount } from 'svelte';
    import confetti from 'canvas-confetti';
    import type { PoolCatalogEntry } from '$lib/types';

    export let open = false;
    export let pool: PoolCatalogEntry;
    
    const dispatch = createEventDispatcher();

    let fromAmount = '';
    let toAmount = '';
    let slippage = '1';
    let isLoading = false;
    let swapError: string | null = null;
    let isReversed = false;
    let balances: { assetId: string, balance: string }[] = [];

    // Create pool ID array for the swap route
    $: pools = pool ? [createPoolId(pool.id)] : undefined;

    // Track which token is from/to based on order
    $: fromToken = isReversed ? pool?.token1Name : pool?.token0Name;
    $: toToken = isReversed ? pool?.token0Name : pool?.token1Name;
    $: fromAssetId = isReversed ? pool?.token1Address : pool?.token0Address;
    $: toAssetId = isReversed ? pool?.token0Address : pool?.token1Address;

    // Get the correct balance based on asset ID
    $: fromBalance = balances.find(b => b.assetId === fromAssetId)?.balance || '0.00';
    $: toBalance = balances.find(b => b.assetId === toAssetId)?.balance || '0.00';

    // Update balances when wallet connects/disconnects or tokens are swapped
    $: if ($connected && $wallet && pool) {
        updateBalances();
    } else {
        balances = [];
    }

    async function updateBalances() {
        if (!$wallet) return;
        
        try {
            const newBalances = await getBalances($wallet, pool);
            balances = newBalances;
        } catch (error) {
            console.error('Error fetching balances:', error);
            balances = [];
        }
    }

    // Preview swap when input amount changes
    $: {
        if (fromAmount && Number(fromAmount) > 0 && pools) {
            previewSwapAmount();
        } else {
            toAmount = '';
        }
    }

    async function previewSwapAmount() {
        try {
            // If isReversed is true, we're swapping token1 for token0
            // If isReversed is false, we're swapping token0 for token1
            // The SDK expects isExactIn=true when we're swapping token0 for token1
            const expectedAmount = await previewSwap(
                fromAmount,
                pools,
                isReversed  // Pass true when swapping token0 for token1
            );
            toAmount = expectedAmount;
        } catch (error) {
            console.error('Preview error:', error);
            toAmount = '0';
        }
    }

    function handleSwapTokens() {
        isReversed = !isReversed;
        const tempAmount = fromAmount;
        fromAmount = toAmount;
        toAmount = tempAmount;
    }

    async function handleSwap() {
        if (!$wallet || !fromAmount || !toAmount) return;
        
        isLoading = true;
        swapError = null;

        try {
            // Calculate minimum output with slippage
            const toAmountNum = Number(toAmount);
            const slippageNum = Number(slippage);
            const minOutputAmount = toAmountNum * (100 - slippageNum) / 100;
            
            // Execute swap with string amounts
            const tx = await executeSwap(
                $wallet,
                fromAmount,
                minOutputAmount.toString(),
                pools,
                isReversed  // Same logic as preview - true when swapping token0 for token1
            );

            console.log('Swap successful:', tx);
            await updateBalances();
            
            // Trigger confetti celebration
            confetti({
                particleCount: 200,
                spread: 130,
                origin: { y: 0.6 },
                colors: ['#26a69a', '#4CAF50', '#81C784'],
                startVelocity: 45,
                scalar: 1.2
            });

            // Close modal after a short delay to show the confetti
            setTimeout(() => {
                handleClose();
            }, 1000);

        } catch (error) {
            console.error('Swap error:', error);
            if (error instanceof Error) {
                swapError = error.message;
            } else {
                swapError = 'Swap failed. Please try again.';
            }
        } finally {
            isLoading = false;
        }
    }

    async function handleButtonClick() {
        if (!$connected) {
            try {
                await connect();
            } catch (error) {
                console.error('Connection error:', error);
            }
        } else {
            await handleSwap();
        }
    }

    function handleClose() {
        if (isLoading) return; // Prevent closing while transaction is in progress
        dispatch('close');
    }

    function formatTokenAmount(amount: string, token: string): string {
        if (!amount) return '0';
        
        const num = Number(amount);
        
        // For ETH, show up to 6 decimal places, but don't force trailing zeros
        if (token === 'ETH') {
            const fixed = num.toFixed(9); // Get full precision first
            const [whole, fraction = ''] = fixed.split('.');
            const truncatedFraction = fraction.slice(0, 6); // Limit to 6 decimal places
            const trimmedFraction = truncatedFraction.replace(/0+$/, ''); // Remove trailing zeros
            return trimmedFraction ? `${whole}.${trimmedFraction}` : whole;
        }
        
        // For PSYCHO, show up to 9 decimal places
        return num.toLocaleString('fullwide', {
            useGrouping: true,
            minimumFractionDigits: 0,
            maximumFractionDigits: 9
        });
    }
</script>

{#if open}
<div 
    class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    on:click|self={handleClose}
>
    <div class="bg-[#1e222d] rounded-2xl w-full max-w-md shadow-xl border border-[#2B2B43] overflow-hidden">
        <!-- Header -->
        <div class="flex items-center justify-between p-4 border-b border-[#2B2B43]">
            <h2 class="text-[#d1d4dc]"><span class="font-semibold">Swap</span> <span class="text-xs italic">(Powered by <a href="https://mira.ly" target="_blank" class="text-[#26a69a] hover:text-[#2196f3]">Mira.ly</a>)</span></h2>
            <button 
                class="text-[#d1d4dc] hover:text-[#26a69a] transition-colors"
                on:click={handleClose}
            >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>

        <!-- Swap Form -->
        <div class="p-4 space-y-4">
            <!-- From Token -->
            <div class="bg-[#131722] rounded-xl p-4 space-y-2 relative">
                {#if isLoading}
                    <div class="absolute inset-0 bg-[#131722]/50 backdrop-blur-sm flex items-center justify-center">
                        <div class="animate-spin text-[#26a69a]">
                            <!-- Add a loading spinner SVG -->
                        </div>
                    </div>
                {/if}
                
                <div class="flex justify-between text-sm text-[#d1d4dc]">
                    <span>From</span>
                    <span>
                        Balance: {formatTokenAmount(fromBalance, fromToken)} 
                        <button 
                            class="ml-1 text-[#26a69a] hover:text-[#26a69a]/80 transition-colors"
                            on:click={() => fromAmount = fromBalance}
                        >
                            max
                        </button>
                    </span>
                </div>
                <div class="flex items-center gap-2">
                    <input 
                        type="text"
                        bind:value={fromAmount}
                        placeholder="0.0"
                        class="flex-1 bg-transparent text-2xl text-[#d1d4dc] outline-none"
                    >
                    <button class="flex items-center gap-2 bg-[#26a69a]/10 hover:bg-[#26a69a]/20 text-[#26a69a] px-3 py-2 rounded-xl transition-colors">
                        <!-- <img 
                            src={`/tokens/${fromToken.toLowerCase()}.png`}
                            alt={fromToken} 
                            class="w-6 h-6 rounded-full"
                        > -->
                        <span class="font-medium">{fromToken}</span>
                    </button>
                </div>
                <!-- <div class="flex items-center gap-2 text-center">
                    <span class="text-[8px] text-[#ffffff] opacity-50">AssetId: {fromAssetId}</span>
                </div> -->
            </div>

            <!-- Swap Direction Button -->
            <div class="flex justify-center -my-2 relative z-10">
                <button 
                    class="bg-[#1e222d] border border-[#2B2B43] rounded-xl p-2 hover:bg-[#26a69a]/10 transition-colors"
                    on:click={handleSwapTokens}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-[#26a69a]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                </button>
            </div>

            <!-- To Token -->
            <div class="bg-[#131722] rounded-xl p-4 space-y-2">
                <div class="flex justify-between text-sm text-[#d1d4dc]">
                    <span>To (estimated)</span>
                    <span>
                        Balance: {formatTokenAmount(toBalance, toToken)}
                    </span>
                </div>
                <div class="flex items-center gap-2">
                    <div class="flex-1 text-2xl text-[#d1d4dc]">
                        {toAmount ? formatTokenAmount(toAmount, toToken) : '0.0'}
                    </div>
                    <button class="flex items-center gap-2 bg-[#26a69a]/10 hover:bg-[#26a69a]/20 text-[#26a69a] px-3 py-2 rounded-xl transition-colors">
                        <!-- <img 
                            src={`/tokens/${toToken.toLowerCase()}.png`}
                            alt={toToken} 
                            class="w-6 h-6 rounded-full"
                        > -->
                        <span class="font-medium">{toToken}</span>
                    </button>
                </div>
                <!-- <div class="flex items-center gap-2 text-center">
                    <span class="text-[8px] text-[#ffffff] opacity-50">AssetId: {toAssetId}</span>
                </div> -->
            </div>

            <!-- Slippage Settings -->
            <div class="bg-[#131722] rounded-xl p-4">
                <div class="flex items-center justify-between text-sm text-[#d1d4dc] mb-2">
                    <span>Slippage Tolerance</span>
                    <span>{slippage}%</span>
                </div>
                <div class="flex gap-2">
                    {#each ['0.5', '1', '2', '3'] as value}
                        <button 
                            class="flex-1 py-1 rounded-lg text-sm {slippage === value ? 'bg-[#26a69a] text-white' : 'bg-[#2B2B43] text-[#d1d4dc] hover:bg-[#26a69a]/20'} transition-colors"
                            on:click={() => slippage = value}
                        >
                            {value}%
                        </button>
                    {/each}
                </div>
            </div>

            <!-- Error Message -->
            {#if swapError}
                <div class="text-[#ef5350] text-sm text-center">
                    {swapError}
                </div>
            {/if}

            <!-- Swap Button -->
            <div class="flex gap-2">
                <!-- Swap Button -->
                <button 
                    class="flex-1 py-4 rounded-xl font-semibold text-white transition-all relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:before:opacity-0 {isLoading || ($connected && !fromAmount) ? 'bg-[#2B2B43]' : 'bg-[#26a69a] hover:bg-[#26a69a]/90'}"
                    disabled={isLoading || ($connected && !fromAmount)} 
                    on:click={handleButtonClick}
                >
                    <span class="relative z-10">
                        {#if isLoading}
                            Loading...
                        {:else if !$connected}
                            Connect
                        {:else if !fromAmount || !toAmount}
                            Enter an amount to swap
                        {:else}
                            Swap
                        {/if}
                    </span>
                    
                    <!-- Enhanced gradient animation overlay -->
                    <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div class="absolute inset-0 bg-gradient-to-r from-[#26a69a]/0 via-white/40 to-[#26a69a]/0 animate-gradient-slide-1"></div>
                        <div class="absolute inset-0 bg-gradient-to-r from-[#26a69a]/0 via-white/30 to-[#26a69a]/0 animate-gradient-slide-2"></div>
                        <div class="absolute inset-0 bg-[#26a69a] opacity-10"></div>
                    </div>
                </button>

                <!-- Bridge Button -->
                <a 
                    href="https://app.fuel.network/bridge?from=eth&to=fuel"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="px-6 py-4 rounded-xl font-semibold text-white bg-[#2B2B43] hover:bg-[#2B2B43]/90 transition-all relative overflow-hidden group"
                >
                    <span class="relative z-10 flex items-center gap-1">
                        Bridge
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                            <polyline points="15 3 21 3 21 9"></polyline>
                            <line x1="10" y1="14" x2="21" y2="3"></line>
                        </svg>
                    </span>
                    
                    <!-- Enhanced gradient animation overlay -->
                    <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div class="absolute inset-0 bg-gradient-to-r from-[#2196f3]/0 via-white/40 to-[#2196f3]/0 animate-gradient-slide-1"></div>
                        <div class="absolute inset-0 bg-gradient-to-r from-[#2196f3]/0 via-white/30 to-[#2196f3]/0 animate-gradient-slide-2"></div>
                        <div class="absolute inset-0 bg-[#2196f3] opacity-10"></div>
                    </div>
                </a>
            </div>
        </div>
    </div>
</div>
{/if} 

<style>
    @keyframes gradient-slide-1 {
        0% {
            transform: translateX(-100%) skewX(-15deg);
        }
        100% {
            transform: translateX(100%) skewX(-15deg);
        }
    }
    
    @keyframes gradient-slide-2 {
        0% {
            transform: translateX(-100%) skewX(15deg);
        }
        100% {
            transform: translateX(100%) skewX(15deg);
        }
    }

    .animate-gradient-slide-1 {
        animation: gradient-slide-1 2s ease infinite;
    }
    
    .animate-gradient-slide-2 {
        animation: gradient-slide-2 2s ease infinite;
        animation-delay: 0.1s;
    }
</style> 