<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { account, connect, connected, wallet } from "svelte-fuels";
    import { previewSwap, executeSwap, createPoolId } from '$lib/services/swap';
    import { getBalance } from '$lib/services/token';
    import { onMount } from 'svelte';
    import confetti from 'canvas-confetti';
    import { pairs, selectedPair } from '$lib/stores/pairs';
    import PairSearch from './pair-search.svelte';
    
    export let open = false;
    
    const dispatch = createEventDispatcher();

    let fromAmount = '';
    let toAmount = '';
    let slippage = '1';
    let isLoading = false;
    let swapError: string | null = null;
    let isEthInput = true;
    let fromBalance = '0.00';
    let toBalance = '0.00';
    let showPairSearch = false;

    // Create pool ID array for the swap route based on selected pair
    $: pools = $selectedPair ? [createPoolId($selectedPair.id)] : [];
    
    // Update token names based on selected pair
    $: fromToken = isEthInput ? $selectedPair?.token0Symbol : $selectedPair?.token1Symbol;
    $: toToken = isEthInput ? $selectedPair?.token1Symbol : $selectedPair?.token0Symbol;

    // Update balances when wallet connects/disconnects or tokens are swapped
    $: if ($connected && $wallet && $selectedPair) {
        updateBalances();
    } else {
        fromBalance = '0.00';
        toBalance = '0.00';
    }

    async function updateBalances() {
        if (!$wallet || !$selectedPair) return;
        
        try {
            const [token0Balance, token1Balance] = await Promise.all([
                getBalance($wallet, $selectedPair.token0Symbol, $selectedPair.id),
                getBalance($wallet, $selectedPair.token1Symbol, $selectedPair.id)
            ]);
            
            fromBalance = isEthInput ? token0Balance : token1Balance;
            toBalance = isEthInput ? token1Balance : token0Balance;
        } catch (error) {
            console.error('Error fetching balances:', error);
            fromBalance = '0.00';
            toBalance = '0.00';
        }
    }

    // Preview swap when input amount changes
    $: {
        if (fromAmount && Number(fromAmount) > 0 && pools.length > 0) {
            previewSwapAmount();
        } else {
            toAmount = '';
        }
    }

    async function previewSwapAmount() {
        try {
            const expectedAmount = await previewSwap(
                fromAmount,
                pools,
                isEthInput
            );
            toAmount = expectedAmount;
        } catch (error) {
            console.error('Preview error:', error);
            toAmount = '0';
        }
    }

    function switchTokens() {
        isEthInput = !isEthInput;
        const tempAmount = fromAmount;
        fromAmount = toAmount;
        toAmount = tempAmount;
        updateBalances();
    }

    function openPairSearch() {
        showPairSearch = true;
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
            
            // Execute swap with string amounts - let the service handle the conversion
            const tx = await executeSwap(
                $wallet,
                fromAmount,
                minOutputAmount.toString(),
                pools,
                isEthInput
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

<!-- Modal Backdrop -->
<div 
    class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
    class:hidden={!open}
    on:click|self={() => dispatch('close')}
>
    <!-- Modal Content -->
    <div class="bg-[#1e222d] w-full max-w-md mx-4 rounded-2xl shadow-xl overflow-hidden">
        <!-- Modal Header -->
        <div class="p-4 border-b border-gray-800 flex justify-between items-center">
            <h2 class="text-xl font-semibold text-white">Swap</h2>
            <button 
                class="text-gray-400 hover:text-white transition-colors"
                on:click={() => dispatch('close')}
            >
                ✕
            </button>
        </div>

        {#if showPairSearch}
            <div class="p-4">
                <PairSearch on:close={() => showPairSearch = false}/>
            </div>
        {:else}
            <!-- Pair Selection -->
            <button 
                class="w-full p-4 text-left hover:bg-[#2B2B43] transition-colors"
                on:click={openPairSearch}
            >
                {#if $selectedPair}
                    <div class="flex items-center justify-between">
                        <span class="text-white font-medium">
                            {$selectedPair.token0Symbol}/{$selectedPair.token1Symbol}
                        </span>
                        {#if $selectedPair.isStable}
                            <span class="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded">
                                Stable
                            </span>
                        {/if}
                    </div>
                {:else}
                    <span class="text-gray-400">Select a trading pair</span>
                {/if}
            </button>

            <!-- Swap Interface -->
            {#if $selectedPair}
                <!-- ... existing swap interface ... -->
            {/if}
        {/if}
    </div>
</div>

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