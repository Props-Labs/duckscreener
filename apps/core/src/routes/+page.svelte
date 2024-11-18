<script lang="ts">
    import { onMount } from 'svelte';
    import Chart from '$lib/components/chart.svelte';
    import { getPriceData } from '$lib/services/blockchain';
    import Chat from '$lib/components/chat.svelte';
    import { browser } from '$app/environment';
    import { showWalletModal, selectedPool, ethPrice, allPools, usdtPrice, usdcPrice, usdePrice } from '$lib/stores';
    import WalletModal from "$lib/components/wallet-modal.svelte";
    import { getTotalAssets, getPoolMetadata} from '$lib/services/dex';
    import SwapModal from '$lib/components/swap-modal.svelte';
    import SearchBox from '$lib/components/search-box.svelte';
    import LoadingOverlay from '$lib/components/loading-overlay.svelte';
    import type { PageData } from './$types';

    export let data: PageData;

    // Set the allPools store with the server data
    $: $allPools = data.pools;

    $: console.log('allPools', $allPools);

    let WalletProvider: any;
   
    onMount(async () => {
        if (browser) {
            const storedPoolId = localStorage.getItem('selectedPool');
            if (storedPoolId) {
                const storedPool = JSON.parse(storedPoolId);
                // Verify the stored pool still exists in our current pool list
                const validPool = $allPools.find(p => p.id === storedPool.id);
                if (validPool) {
                    $selectedPool = validPool;
                } else {
                    // If stored pool is no longer valid, use first available pool
                    $selectedPool = $allPools[0];
                }
            } else {
                // No stored pool, use first available pool
                $selectedPool = $allPools[0];
            }

            const module = await import('svelte-fuels');
            WalletProvider = module.WalletProvider;
        }
        
        const totalAssets = await getTotalAssets();
        console.log('totalAssets', Number(totalAssets));
        const poolMetadata = await getPoolMetadata($selectedPool);
        console.log('poolMetadata', poolMetadata);
    });
    
    let currentTokenPrice = 0;
    let poolMetadata: any;
    const TOTAL_SUPPLY = 1_000_000_000;
    let isChatOpen = false;
    let liquidityUSD = 0;
    let isSwapModalOpen = false;
    let isLoading = false;

    function handlePriceUpdate(event: CustomEvent<number>) {
        currentTokenPrice = event.detail;
    }

    async function updatePoolData() {
        try {
            // Get ETH price
            const [ethPriceData, usdtPriceData, usdcPriceData, usdePriceData] = await Promise.all([
                getPriceData("0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419"),
                getPriceData("0x3E7d1eAB13ad0104d2750B8863b489D65364e32D"),
                getPriceData("0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6"),
                getPriceData("0xa569d910839Ae8865Da8F8e70FfFb0cBA869F961")
            ]);

            $ethPrice = ethPriceData;
            $usdtPrice = usdtPriceData;
            $usdcPrice = usdcPriceData;
            $usdePrice = usdePriceData;

            // Convert all formattedPrice values to numbers
            [$ethPrice, $usdtPrice, $usdcPrice, $usdePrice].forEach(price => {
                if (price?.formattedPrice) {
                    price.formattedPrice = Number(price.formattedPrice);
                }
            });

            console.log('selectedPool:::', $selectedPool);
            // Get pool metadata
            poolMetadata = await getPoolMetadata($selectedPool);
            
            // Calculate liquidity in USD
            if (poolMetadata && $ethPrice?.formattedPrice) {
                const ethInPool = Number(poolMetadata.reserve1) / 1e9; // Convert from decimals
                liquidityUSD = ethInPool * $ethPrice.formattedPrice * 2; // Multiply by 2 since it's paired liquidity
            }
        } catch (error) {
            console.error('Error updating pool data:', error);
        }
    }

    // Replace the existing get$ethPrice reactive statement with this
    $: updatePoolData();
    $: marketCap = currentTokenPrice * TOTAL_SUPPLY * ($ethPrice?.formattedPrice || 0);

    function formatCurrency(value: number): string {
        if (value >= 1_000_000_000) {
            return `$${(value / 1_000_000_000).toFixed(2)}B`;
        } else if (value >= 1_000_000) {
            return `$${(value / 1_000_000).toFixed(2)}M`;
        } else if (value >= 1_000) {
            return `$${(value / 1_000).toFixed(2)}K`;
        }
        return `$${value.toFixed(2)}`;
    }

    function toggleChat() {
        isChatOpen = !isChatOpen;
    }

    async function handlePoolSelect(event: CustomEvent<PoolCatalogEntry>) {
        try {
            isLoading = true;
            // The selectedPool store will automatically sync with localStorage
            $selectedPool = event.detail;
            await updatePoolData();
        } catch (error) {
            console.error('Error loading pool data:', error);
        }
    }

    function handleChartLoadingChange(event: CustomEvent<boolean>) {
        isLoading = event.detail;
    }
</script>

<div class="flex h-screen bg-[#131722] relative">
    <!-- Mobile Chat Toggle Button -->
    <button
        class="sm:hidden fixed top-0 right-4 z-20 bg-[#26a69a] text-white px-4 py-1 rounded-b-lg shadow-lg hover:bg-[#2196f3] transition-colors"
        on:click={toggleChat}
    >
        Chat {isChatOpen ? '×' : '▼'}
    </button>

    <!-- Left side - Chart -->
    <div class="flex-1 flex flex-col min-w-0">
        <Chart 
            bind:pool={$selectedPool} 
            {liquidityUSD}
            {marketCap}
            on:priceUpdate={handlePriceUpdate}
            on:loadingChange={handleChartLoadingChange}
        >
            <div slot="toolbar" class="flex flex-col sm:flex-row items-start sm:items-center justify-between flex-1 text-[#d1d4dc] w-full">
                <div class="flex flex-col items-start w-full sm:w-auto order-first mb-2 sm:mb-0">
                    <div class="flex flex-row">
                        <img src="/logo.png" class="w-6 h-6 mr-2" />
                        <span class="text-xl sm:text-xl font-bold text-white relative group">
                            
                            FuelCharts.com
                            <!-- <span class="absolute -inset-1 bg-gradient-to-r from-[#26a69a]/20 via-[#2196f3]/20 to-[#26a69a]/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
                            <span class="absolute -bottom-0.5 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#26a69a] to-transparent"></span> -->
                        </span>
                    </div>
                    <div class="flex flex-col gap-1 mt-2">
                        <div class="flex items-center gap-3 text-[11px] sm:text-[11px]">
                            <a 
                                on:click|preventDefault={() => isSwapModalOpen = true}
                                class="relative inline-flex items-center px-4 py-1.5 bg-gradient-to-r from-[#26a69a] to-[#2196f3] rounded-lg overflow-hidden group hover:scale-105 transition-transform duration-200 cursor-pointer"
                            >
                                <span class="absolute inset-0 opacity-20 bg-repeat animate-sparkle"></span>
                                <span class="relative font-semibold text-white flex items-center gap-1.5">
                                    Trade {$selectedPool ? `$${$selectedPool.token0Name}/$${$selectedPool.token1Name}` : 'Token'}
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M7 11l5-5m0 0l5 5m-5-5v12"/>
                                    </svg>
                                </span>
                                <span class="absolute -inset-x-1 bottom-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-50"></span>
                            </a>
                            <span class="text-[#d1d4dc] opacity-40">|</span>
                            <a 
                                href="https://fuelup.fun"
                                target="_blank"
                            >
                            <span class="text-xs font-bold bg-gradient-to-r from-[#26a69a] via-[#2196f3] to-[#26a69a] text-transparent bg-clip-text bg-size-200 animate-gradient-x relative group flex items-center gap-1">
                                Launch Your Own Token on Fuel
                            </span>
                            </a>
                            
                        </div>
                    </div>
                </div>

                <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <SearchBox on:select={handlePoolSelect} />
                    
                    <div class="grid grid-cols-2 gap-2 w-full sm:w-auto">
                        <div class="flex flex-col bg-[#1e222d] p-3 rounded-lg border border-[#2B2B43] hover:border-[#26a69a] transition-colors">
                            <div class="flex items-center space-x-2">
                                <span class="text-xs sm:text-sm opacity-80">Market Cap</span>
                                <span class="text-sm sm:text-base font-semibold text-[#26a69a]">{formatCurrency(marketCap)}</span>
                            </div>
                            <div class="flex items-center mt-1">
                                <span class="text-[10px] opacity-60 bg-[#26a69a]/10 px-2 py-0.5 rounded-full text-[#26a69a]">
                                    Supply: 1B
                                </span>
                            </div>
                        </div>
                        <div class="flex flex-col bg-[#1e222d] p-3 rounded-lg border border-[#2B2B43] hover:border-[#26a69a] transition-colors">
                            <div class="flex items-center space-x-2">
                                <span class="text-xs sm:text-sm opacity-80">Pool TVL</span>
                                <span class="text-sm sm:text-base font-semibold text-[#26a69a]">{formatCurrency(liquidityUSD)}</span>
                            </div>
                            <div class="flex items-center justify-between mt-1">
                                <span class="text-[10px] opacity-60 bg-[#26a69a]/10 px-2 py-0.5 rounded-full text-[#26a69a]">
                                    {poolMetadata ? `${(Number(poolMetadata.reserve1) / 1e9).toFixed(2)} ETH` : '0.00 ETH'}
                                </span>
                                <a 
                                    href="https://mira.ly/liquidity/add/?pool=PSYCHO-ETH-volatile"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    class="text-[10px] opacity-60 bg-[#26a69a]/10 px-2 py-0.5 rounded-full text-[#26a69a] hover:bg-[#26a69a] hover:text-white hover:opacity-100 transition-all duration-200"
                                >
                                    Add LP
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Chart>
    </div>

    <!-- Right side - Chat (Desktop) -->
    <div class="hidden sm:block w-80 border-l border-[#2B2B43]">
        {#if $selectedPool}
            <Chat bind:poolId={$selectedPool.id} />
        {/if}
    </div>

    <!-- Mobile Chat Panel -->
    <div
        class="sm:hidden fixed inset-0 bg-[#131722] z-[60] transition-transform duration-300 ease-in-out {isChatOpen ? 'translate-y-0' : 'translate-y-full'}"
    >
        <div class="h-full pt-10">
            <Chat {$selectedPool} on:close={() => isChatOpen = false} />
        </div>
    </div>
</div>
{#if browser && WalletProvider}
    <WalletProvider>
        <WalletModal open={$showWalletModal} on:close={() => showWalletModal.set(false)} />
    </WalletProvider>
{/if}

<SwapModal 
    bind:open={isSwapModalOpen}
    pool={$selectedPool}
    on:close={() => isSwapModalOpen = false}
/>

<LoadingOverlay visible={isLoading} />

<style>
    .bg-size-200 {
        background-size: 200% auto;
    }

    .animate-gradient-x {
        animation: gradient 3s linear infinite;
    }

    @keyframes gradient {
        0% {
            background-position: 0% 50%;
        }
        50% {
            background-position: 100% 50%;
        }
        100% {
            background-position: 0% 50%;
        }
    }

    @keyframes sparkle {
        0% {
            background-position: 0 0;
        }
        100% {
            background-position: 100% 100%;
        }
    }

    .animate-sparkle {
        animation: sparkle 8s linear infinite;
    }
</style>

