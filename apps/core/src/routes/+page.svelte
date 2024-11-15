<script lang="ts">
    import { onMount } from 'svelte';
    import Chart from '$lib/components/chart.svelte';
    import { getPriceData } from '$lib/services/blockchain';
    import Chat from '$lib/components/chat.svelte';
    import { browser } from '$app/environment';
    import { showWalletModal } from '$lib/stores';
    import WalletModal from "$lib/components/wallet-modal.svelte";
    import { getTotalAssets, getPoolMetadata} from '$lib/services/dex';
    
    let WalletProvider: any;
    const poolId = "0x86fa05e9fef64f76fa61c03f5906c87a03cb9148120b6171910566173d36fc9e_0xf8f8b6283d7fa5b672b530cbb84fcccb4ff8dc40f8176ef4544ddb1f1952ad07_false";

    onMount(async () => {
        if (browser) {
            const module = await import('svelte-fuels');
            WalletProvider = module.WalletProvider;
        }
        const totalAssets = await getTotalAssets();
        console.log('totalAssets', Number(totalAssets));
        const poolMetadata = await getPoolMetadata(poolId);
        console.log('poolMetadata', poolMetadata);
    });
    
    let ethPrice: any;
    let currentTokenPrice = 0;
    let poolMetadata: any;
    const TOTAL_SUPPLY = 1_000_000_000;
    let isChatOpen = false;
    let liquidityUSD = 0;

    function handlePriceUpdate(event: CustomEvent<number>) {
        currentTokenPrice = event.detail;
    }

    async function updatePoolData() {
        try {
            // Get ETH price
            ethPrice = await getPriceData("0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419");
            if (ethPrice?.formattedPrice) {
                ethPrice.formattedPrice = Number(ethPrice.formattedPrice);
            }

            // Get pool metadata
            poolMetadata = await getPoolMetadata(poolId);
            
            // Calculate liquidity in USD
            if (poolMetadata && ethPrice?.formattedPrice) {
                const ethInPool = Number(poolMetadata.reserve1) / 1e9; // Convert from decimals
                liquidityUSD = ethInPool * ethPrice.formattedPrice * 2; // Multiply by 2 since it's paired liquidity
            }
        } catch (error) {
            console.error('Error updating pool data:', error);
        }
    }

    // Replace the existing getEthPrice reactive statement with this
    $: updatePoolData();
    $: marketCap = currentTokenPrice * TOTAL_SUPPLY * (ethPrice?.formattedPrice || 0);

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
        <Chart {poolId} on:priceUpdate={handlePriceUpdate}>
            <div slot="toolbar" class="flex flex-col sm:flex-row items-start sm:items-center justify-between flex-1 text-[#d1d4dc] w-full">
                <div class="flex flex-col items-start w-full sm:w-auto order-first mb-4 sm:mb-0">
                    <div class="flex flex-col">
                        <span class="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#26a69a] via-[#2196f3] to-[#26a69a] text-transparent bg-clip-text bg-size-200 animate-gradient-x relative group">
                            Duckscreener
                            <span class="absolute -inset-1 bg-gradient-to-r from-[#26a69a]/20 via-[#2196f3]/20 to-[#26a69a]/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
                            <span class="absolute -bottom-0.5 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#26a69a] to-transparent"></span>
                        </span>
                    </div>
                    <div class="flex flex-col gap-1 mt-2">
                        <div class="flex items-center gap-2 text-[9px] sm:text-[10px]">
                            <span class="opacity-80 hover:opacity-100 transition-opacity">
                                <a href="https://mira.ly/swap/" target="_blank" class="text-[#ffffff] hover:text-[#26a69a] transition-colors">Buy $PSYCHO</a>
                            </span> 
                            <span class="text-[#d1d4dc] opacity-40">|</span>
                            <span class="opacity-80 hover:opacity-100 transition-opacity">
                                <a href="https://t.co/QEmd2tfaqm" target="_blank" class="text-[#26a69a] hover:text-[#2196f3] transition-colors">Telegram</a>
                            </span>
                            <span class="text-[#d1d4dc] opacity-40">|</span>
                            <span class="opacity-40 hover:opacity-100 transition-opacity">
                                <a href="https://x.com/Bitcoinski" target="_blank" class="text-[#26a69a] hover:text-[#2196f3] transition-colors">@Bitcoinski</a>
                            </span>
                        </div>
                    </div>
                </div>

                <div class="flex flex-col gap-3 w-full sm:w-auto">
                    <div class="grid grid-cols-2 gap-3 w-full sm:flex sm:w-auto order-last sm:order-none">
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
                            <div class="flex items-center mt-1">
                                <span class="text-[10px] opacity-60 bg-[#26a69a]/10 px-2 py-0.5 rounded-full text-[#26a69a]">
                                    {poolMetadata ? `${(Number(poolMetadata.reserve1) / 1e9).toFixed(2)} ETH` : '0.00 ETH'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Chart>
    </div>

    <!-- Right side - Chat (Desktop) -->
    <div class="hidden sm:block w-80 border-l border-[#2B2B43]">
        <Chat {poolId} />
    </div>

    <!-- Mobile Chat Panel -->
    <div
        class="sm:hidden fixed inset-0 bg-[#131722] z-10 transition-transform duration-300 ease-in-out {isChatOpen ? 'translate-y-0' : 'translate-y-full'}"
    >
        <div class="h-full pt-10">
            <Chat {poolId} on:close={() => isChatOpen = false} />
        </div>
    </div>
</div>

{#if browser && WalletProvider}
    <WalletProvider>
        <WalletModal open={$showWalletModal} on:close={() => showWalletModal.set(false)} />
    </WalletProvider>
{/if}

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
</style>
