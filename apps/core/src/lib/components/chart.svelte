<script lang="ts">
    import { onMount, onDestroy, tick } from 'svelte';
    import { getTradingData, convertTradingDataToChartData, type TimeFrame } from '$lib/services/data';
    import { selectedCounterPartyToken } from '$lib/stores';
    import { createChart, ColorType } from 'lightweight-charts';
    import { createEventDispatcher } from 'svelte';
    import type { PoolCatalogEntry } from '$lib/types';
    interface SwapEvent {
        exchange_rate: string;
        time: number;
        asset_0_in: string;
        asset_0_out: string;
        asset_1_in: string;
        asset_1_out: string;
        is_buy: boolean;
        is_sell: boolean;
        transaction_id: string;
        isNew?: boolean;
    }

    interface Stats {
        price: {
            usd: string;
            eth: string;
            lastTradeIsBuy: boolean;
        };
        liquidity: {
            usd: number;
            eth: number;
            fdv: number;
            mcap: number;
        };
        changes: {
            '1H': number;
            '6H': number;
            '24H': number;
            '1W': number;
        };
        transactions: {
            total: number;
            buys: number;
            sells: number;
            volume: number;
            buyVolume: number;
            sellVolume: number;
            volumeDelta: number;
            makers: number;
            buyers: number;
            sellers: number;
        };
    }

    const dispatch = createEventDispatcher<{
        priceUpdate: number;
        loadingChange: boolean;
    }>();
    
    export let pool: PoolCatalogEntry;
    export let liquidityUSD: number;
    export let marketCap: number;
    let chart: any;
    let candlestickSeries: any;
    let selectedTimeFrame: TimeFrame = '1h';
    let chartContainer: HTMLElement;
    let isLoading = false;
    
    let rawData: SwapEvent[] = [];
    let visibleData: SwapEvent[] = [];
    let tableContainer: HTMLElement;
    let pageSize = 20;
    let currentPage = 0;
    let loading = false;
    
    const timeFrameOptions: TimeFrame[] = ['1s', '1m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '12h', '24h'];
    
    const chartOptions = { 
        layout: { 
            textColor: '#d1d4dc',
            background: { 
                type: ColorType.Solid, 
                color: '#131722' 
            }
        },
        timeScale: {
            timeVisible: true,
            secondsVisible: false,
            borderColor: '#2B2B43',
            textColor: '#d1d4dc',
        },
        rightPriceScale: {
            scaleMargins: {
                top: 0.1,
                bottom: 0.1,
            },
            borderVisible: true,
            borderColor: '#2B2B43',
            textColor: '#d1d4dc',
            autoScale: true,
            alignLabels: true,
            mode: 0,
            visible: true,
            entireTextOnly: false,
            ticksVisible: true,
            formatPrice: (price: number) => {
                if (price < 0.000001) {
                    return price.toExponential(6);
                }
                return price.toLocaleString('en-US', {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 9,
                    useGrouping: false
                });
            },
        },
        grid: {
            vertLines: {
                color: '#2B2B43',
                style: 1,
                visible: true,
            },
            horzLines: {
                color: '#2B2B43',
                style: 1,
                visible: true,
            },
        },
        crosshair: {
            mode: 1,
            vertLine: {
                color: '#758696',
                width: 1,
                style: 1,
                labelBackgroundColor: '#131722',
                labelVisible: true,
            },
            horzLine: {
                color: '#758696',
                width: 1,
                style: 1,
                labelBackgroundColor: '#131722',
                labelVisible: true,
            },
        },
    };

    let isRefreshing = false;
    let autoRefreshInterval: number;

    let previousTransactionIds = new Set<string>();

    let autoRefreshEnabled = true;

    let isInitialLoad = true;

    let isTableExpanded = false;

    let selectedStatsTimeframe = '1H';

    let stats: Stats = {
        price: { usd: '0', eth: '0' },
        liquidity: { usd: 0, eth: 0, fdv: 0, mcap: 0 },
        changes: { '1H': 0, '6H': 0, '24H': 0, '1W': 0 },
        transactions: {
            total: 0,
            buys: 0,
            sells: 0,
            volume: 0,
            buyVolume: 0,
            sellVolume: 0,
            volumeDelta: 0,
            makers: 0,
            buyers: 0,
            sellers: 0
        }
    };

    let isStatsLoading = false;


    function setupAutoRefresh() {
        if (autoRefreshInterval) {
            clearInterval(autoRefreshInterval);
        }
        
        if (autoRefreshEnabled) {
            autoRefreshInterval = setInterval(() => {
                loadChartData(selectedTimeFrame, false);
            }, 10000) as unknown as number;
        }
    }

    function handleChartResize() {
        if (chart && chartContainer) {
            const { width, height } = chartContainer.getBoundingClientRect();
            chart.applyOptions({ 
                width: width,
                height: height
            });
        }
    }
    async function calculateStats(timeframe: string) {
        isStatsLoading = true;
        console.log("isStatsLoading111", isStatsLoading)
        try {
            console.log("calculateStats:::", timeframe)
            if (!rawData.length) return;

            const now = Date.now();
            const timeInMs = {
                '1H': 60 * 60 * 1000,
                '6H': 6 * 60 * 60 * 1000,
                '24H': 24 * 60 * 60 * 1000,
                '1W': 7 * 24 * 60 * 60 * 1000
            }[timeframe];

            const cutoffTime = now - timeInMs;
            const relevantTrades = rawData.filter(trade => trade.time * 1000 >= cutoffTime);
            
            // Calculate transactions stats for the selected timeframe
            const buys = relevantTrades.filter(t => t.is_buy);
            const sells = relevantTrades.filter(t => t.is_sell);
            
            // Get unique addresses for the selected timeframe
            const uniqueMakers = new Set(relevantTrades.map(t => t.recipient));
            const uniqueBuyers = new Set(buys.map(t => t.recipient));
            const uniqueSellers = new Set(sells.map(t => t.recipient));

            // Calculate volume in terms of token0 (base token)
            const buyVolume = buys.reduce((acc, t) => acc + Number(t.asset_0_out) / 1e9, 0);
            const sellVolume = sells.reduce((acc, t) => acc + Number(t.asset_0_in) / 1e9, 0);
            const volume = buyVolume + sellVolume;
            const volumeDelta = buyVolume - sellVolume;

            // Update stats object with new calculations
            stats.transactions = {
                total: relevantTrades.length,
                buys: buys.length,
                sells: sells.length,
                volume,
                buyVolume,
                sellVolume,
                volumeDelta,
                makers: uniqueMakers.size,
                buyers: uniqueBuyers.size,
                sellers: uniqueSellers.size
            };

             stats.changes = {
                '1H': calculatePriceChangeForPeriod('1H'),
                '6H': calculatePriceChangeForPeriod('6H'),
                '24H': calculatePriceChangeForPeriod('24H'),
                '1W': calculatePriceChangeForPeriod('1W')
            };

        } finally {
            isStatsLoading = false;
            console.log("isStatsLoading222", isStatsLoading)
        }
    }

    let isCalculatingPrice = false;

    function calculatePrice() {
        isCalculatingPrice = true;
        const latestTrade = rawData[0];
        console.log("latestTrade:::", latestTrade)
        const exchangeRate = Number(latestTrade.exchange_rate) / 1e18;
        console.log("$selectedCounterPartyToken", $selectedCounterPartyToken)
        const _usdPrice = exchangeRate * ($selectedCounterPartyToken?.priceUSD || 0);

        console.log('usdPrice:::11', _usdPrice)

        stats.price = {
            eth: exchangeRate.toString(),
            usd: _usdPrice.toString(),
            lastTradeIsBuy: latestTrade.is_buy
        };

        dispatch('priceUpdate', _usdPrice);
        isCalculatingPrice = false;
    }

    function calculatePriceChangeForPeriod(period: '1H' | '6H' | '24H' | '1W'): number {
        const now = Date.now();
        const periodMs = {
            '1H': 60 * 60 * 1000,
            '6H': 6 * 60 * 60 * 1000,
            '24H': 24 * 60 * 60 * 1000,
            '1W': 7 * 24 * 60 * 60 * 1000
        }[period];

        const cutoffTime = now - periodMs;
        const relevantTrades = rawData.filter(trade => trade.time * 1000 >= cutoffTime);

        if (relevantTrades.length < 2) return 0;

        const oldestExchangeRate = Number(relevantTrades[0].exchange_rate) / 1e18;
        const newestExchangeRate = Number(relevantTrades[relevantTrades.length - 1].exchange_rate) / 1e18;
        const deltaExchangeRate = oldestExchangeRate - newestExchangeRate;
       

        // Calculate percentage change
        const percentageChange = (deltaExchangeRate / oldestExchangeRate) * 100;
        
        // For stablecoin pairs, we need to invert the percentage change
        // if (['USDT', 'USDC', 'USDE', 'SDAI', 'SUSDE'].includes(pool.token1Name.toUpperCase())) {
        //     return -percentageChange;
        // }
        
        return percentageChange;
    }

    async function loadChartData(timeFrame: TimeFrame, showFullScreenLoader = true) {
        try {
            if (showFullScreenLoader) {
                isLoading = true;
                dispatch('loadingChange', true);
            }
            isRefreshing = !showFullScreenLoader;
            
            console.log('Loading chart data for', pool);
            const newRawData = await getTradingData(pool.id);
            
            if (!isInitialLoad) {
                newRawData.forEach(event => {
                    event.isNew = !previousTransactionIds.has(event.transaction_id);
                });
            }
            
            previousTransactionIds = new Set(newRawData.map(event => event.transaction_id));
            
            rawData = newRawData;
            const candlesticks = await convertTradingDataToChartData(rawData, timeFrame);
            if (candlestickSeries) {
                candlestickSeries.setData(candlesticks);
                
                // Calculate stats for all timeframes
                // ['1H', '6H', '24H', '1W'].forEach(timeframe => {
                //     calculateStats(timeframe);
                // });
                
                if (isInitialLoad) {
                    chart.timeScale().fitContent();
                    isInitialLoad = false;
                }
                
                if (candlesticks.length > 0) {
                    dispatch('priceUpdate', candlesticks[candlesticks.length - 1].close);
                }
            }
            
            visibleData = [];
            currentPage = 0;
            await loadMoreData();
        } catch (error) {
            console.error('Error loading chart data:', error);
        } finally {
            isLoading = false;
            isRefreshing = false;
            dispatch('loadingChange', false);
        }
    }

    async function loadMoreData() {
        if (loading) return;
        loading = true;
        
        const start = currentPage * pageSize;
        const end = start + pageSize;
        const newData = rawData.slice(start, end);
        
        if (newData.length > 0) {
            visibleData = [...visibleData, ...newData];
            currentPage++;
            await tick();
        }
        
        loading = false;
    }

    function handleScroll(event: Event) {
        const target = event.target as HTMLElement;
        const bottom = target.scrollHeight - target.scrollTop - target.clientHeight < 50;
        
        if (bottom) {
            loadMoreData();
        }
    }

    function formatTime(timestamp: number): string {
        return new Date(timestamp * 1000).toLocaleString();
    }

    function formatNumber(value: string): string {
        const num = Number(value) / 1e18;
        return num.toExponential(4);
    }

    async function handleTimeFrameChange(event: Event) {
        const select = event.target as HTMLSelectElement;
        selectedTimeFrame = select.value as TimeFrame;
        await loadChartData(selectedTimeFrame);
        setupAutoRefresh();
    }

    function formatEthNumber(inValue: string, outValue: string, isBuy: boolean): string {
        if (isBuy) {
            const ethIn = Number(inValue) / 1e18;
            return (-ethIn).toFixed(4);
        } else {
            const ethOut = Number(outValue) / 1e18;
            return ethOut.toFixed(4);
        }
    }

    function formatTokenNumber(inValue: string, outValue: string, isBuy: boolean): string {
        const value = isBuy 
            ? Number(outValue) / 1e9 
            : -(Number(inValue) / 1e9);

        let maxDigits = 2;
        // Handle very small numbers
        if (Math.abs(value) < 0.000001) {
            maxDigits = 16;
            //return value.toExponential(6);
        }
        else{

        }
        
        // Handle regular numbers
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: maxDigits,
            useGrouping: true
        }).format(value);
    }

    function getPriceDirection(currentRate: string, previousRate: string): string {
        const current = Number(currentRate);
        const previous = Number(previousRate);
        
        if (current > previous) return '↑';
        if (current < previous) return '↓';
        return '→';
    }

    function getPriceDirectionColor(currentRate: string, previousRate: string): string {
        const current = Number(currentRate);
        const previous = Number(previousRate);
        
        if (current > previous) return 'text-[#26a69a]';
        if (current < previous) return 'text-[#ef5350]';
        return 'text-[#d1d4dc]';
    }

    function handleAutoRefreshToggle() {
        autoRefreshEnabled = !autoRefreshEnabled;
        setupAutoRefresh();
    }

    onMount(async () => {
        const { width, height } = chartContainer.getBoundingClientRect();
        const initialOptions = {
            ...chartOptions,
            width,
            height
        };

        chart = createChart(chartContainer, initialOptions);
        candlestickSeries = chart.addCandlestickSeries({
            upColor: '#26a69a', 
            downColor: '#ef5350', 
            borderVisible: false,
            wickUpColor: '#26a69a',
            wickDownColor: '#ef5350',
            priceFormat: {
                type: 'price',
                precision: 9,
                minMove: 0.000000001,
            },
        });
        
        await loadChartData(selectedTimeFrame);
        setupAutoRefresh();
        
        window.addEventListener('resize', handleChartResize);
        handleChartResize();
    });

    onDestroy(() => {
        if (typeof window !== 'undefined') {
            window.removeEventListener('resize', handleChartResize);
        }
        if (autoRefreshInterval) {
            clearInterval(autoRefreshInterval);
        }
    });

    $: if (pool) {
        loadChartData(selectedTimeFrame);
    }

    $: formattedStats = {
        ...stats,
        liquidity: {
            ...stats.liquidity,
            usd: formatCurrency(stats.liquidity.usd),
            eth: stats.liquidity.eth.toFixed(2),
            fdv: formatCurrency(stats.liquidity.fdv),
            mcap: formatCurrency(stats.liquidity.mcap)
        },
        transactions: {
            ...stats.transactions,
            volume: formatCurrency(stats.transactions.volume * selectedCounterPartyToken.priceUSD),
            buyVolume: formatCurrency(stats.transactions.buyVolume * selectedCounterPartyToken.priceUSD),
            sellVolume: formatCurrency(stats.transactions.sellVolume * selectedCounterPartyToken.priceUSD)
        }
    };

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

    // Add this reactive statement to recalculate stats when timeframe changes
    $: if (selectedStatsTimeframe && rawData.length) {
        console.log("calculatestats::::11")
        calculateStats(selectedStatsTimeframe);
    }

    $: if(rawData.length){
        calculatePrice()
    }
</script>

<div class="flex flex-col w-full h-full bg-[#131722] relative overflow-y-auto">
    <div class="p-4 flex flex-col sm:flex-row items-start sm:items-center w-full gap-4">
        <div class="flex-1">
            <slot name="toolbar" />
        </div>

        <div class="flex items-center gap-2">
            <button 
                on:click={() => loadChartData(selectedTimeFrame, false)}
                class="p-2 border rounded bg-[#2B2B43] text-[#d1d4dc] border-[#2B2B43] hover:bg-[#363a45] transition-colors"
                aria-label="Refresh data"
                disabled={isRefreshing}
            >
                <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    stroke-width="2" 
                    stroke-linecap="round" 
                    stroke-linejoin="round"
                    class={isRefreshing ? 'animate-spin' : ''}
                >
                    <path d="M21 2v6h-6"></path>
                    <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
                    <path d="M3 22v-6h6"></path>
                    <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
                </svg>
            </button>
            
            <label class="inline-flex items-center cursor-pointer">
                <input
                    type="checkbox"
                    class="sr-only peer"
                    bind:checked={autoRefreshEnabled}
                    on:change={handleAutoRefreshToggle}
                >
                <div class="relative w-9 h-5 bg-[#2B2B43] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#26a69a]"></div>
                <span class="ms-1 text-xs text-[#d1d4dc] opacity-80">Auto</span>
            </label>
            
            <select 
                value={selectedTimeFrame}
                on:change={handleTimeFrameChange}
                class="p-2 border rounded bg-[#2B2B43] text-[#d1d4dc] border-[#2B2B43] text-sm"
            >
                {#each timeFrameOptions as timeFrame}
                    <option value={timeFrame}>{timeFrame}</option>
                {/each}
            </select>
        </div>
    </div>
    
    <div 
        bind:this={chartContainer} 
        class="w-full transition-[height] duration-300 ease-in-out relative z-0"
        style="height: {isTableExpanded ? '30vh' : '70vh'}"
    ></div>

    <button 
        class="w-full h-8 flex items-center justify-center bg-[#1e222d] border-y border-[#2B2B43] text-[#d1d4dc] hover:bg-[#2B2B43] transition-colors relative z-10"
        on:click={() => {
            isTableExpanded = !isTableExpanded;
            if (chart) {
                const newHeight = isTableExpanded ? '30vh' : '70vh';
                chartContainer.style.height = newHeight;
                
                setTimeout(() => {
                    const { height } = chartContainer.getBoundingClientRect();
                    chart.applyOptions({ 
                        height: height
                    });
                    chart.timeScale().fitContent();
                }, 300);
            }
        }}
    >
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            class="h-4 w-4 transform transition-transform duration-300 {isTableExpanded ? 'rotate-180' : ''}" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
        >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
    </button>

    <div class="w-full overflow-x-auto bg-[#131722] border-y border-[#2B2B43] pt-4 py-8">
        <div class="flex min-w-max gap-4 px-4 relative">
            <!-- Loading Overlay for Stats -->
            {#if isStatsLoading}
                <div class="absolute inset-0 bg-[#131722]/80 flex items-center justify-center z-50 rounded-lg">
                    <div class="flex items-center gap-2">
                        <svg 
                            class="animate-spin h-5 w-5 text-[#26a69a]" 
                            xmlns="http://www.w3.org/2000/svg" 
                            fill="none" 
                            viewBox="0 0 24 24"
                        >
                            <circle 
                                class="opacity-25" 
                                cx="12" 
                                cy="12" 
                                r="10" 
                                stroke="currentColor" 
                                stroke-width="4"
                            ></circle>
                            <path 
                                class="opacity-75" 
                                fill="currentColor" 
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                        </svg>
                        <span class="text-[#d1d4dc] text-sm">Updating stats...</span>
                    </div>
                </div>
            {/if}

            <!-- Stats Widgets -->
            <div class="flex gap-2">
                <!-- Price USD -->
                <div class="bg-[#1e222d] p-2.5 rounded-lg border border-[#2B2B43] transition-colors min-w-[200px]">
                    <div class="text-[#d1d4dc] text-xs opacity-60">PRICE USD</div>
                    <div class="text-[#d1d4dc] font-semibold flex items-center gap-2">
                        ${Number(stats.price.usd).toLocaleString('en-US', {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 9,
                            useGrouping: false
                        })}
                        {#if isCalculatingPrice}
                            <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                width="12" 
                                height="12" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="currentColor" 
                                stroke-width="2" 
                                stroke-linecap="round" 
                                stroke-linejoin="round"
                                class="animate-spin"
                            >
                                <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                            </svg>
                        {/if}
                    </div>
                    <!-- <div class="text-[#d1d4dc] text-xs">
                        {Number(stats.price.usd)} / {Number(stats.price.eth)}
                        1 {pool.token1Name} = {(Number(stats.price.eth) / Number(stats.price.usd))} {pool.token0Name}
                    </div> -->
                    
                    <div class="text-[#d1d4dc] text-xs opacity-80">
                        @ ${($selectedCounterPartyToken?.priceUSD || 0).toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        })} / {pool.token1Name}
                    </div>
                   
                    <div class="text-[#d1d4dc] text-xs opacity-80">
                        <span>MCap: {formatCurrency(marketCap)}</span>
                    </div>
                    
                </div>

                <!-- Liquidity -->
                <div class="bg-[#1e222d] p-2.5 rounded-lg border border-[#2B2B43] transition-colors min-w-[200px]">
                    <div class="text-[#d1d4dc] text-xs opacity-60">LIQUIDITY</div>
                    <div class="text-[#d1d4dc] font-semibold flex flex-col gap-1 text-xs">
                        <div class="flex items-center justify-between">
                            <span>
                                {(Number(pool.reserve0) / 1e9).toLocaleString('en-US', {
                                    maximumFractionDigits: 0
                                })} {pool.token0Name}
                            </span>
                            
                        </div>
                        <div class="flex items-center justify-between">
                            <span>{(Number(pool.reserve1) / 1e9).toFixed(2)} {pool.token1Name}</span>
                           
                        </div>
                    </div>
                  
                    <div class="flex justify-between items-center text-xs">
                        <span class="text-[#d1d4dc] opacity-60">≈ {formatCurrency(liquidityUSD)}</span>
                    </div>
                </div>

                <!-- Price Changes with integrated timeframe selection -->
                <div class="bg-[#1e222d] p-2.5 rounded-lg border border-[#2B2B43] transition-colors min-w-[200px]">
                    <div class="grid grid-cols-4 gap-2">
                        {#each ['1H', '6H', '24H', '1W'] as timeframe}
                            <button
                                class="flex flex-col items-center rounded-lg transition-all {selectedStatsTimeframe === timeframe ? 'ring-1 ring-[#26a69a]' : ''} hover:bg-[#26a69a]/10 p-1"
                                on:click={() => selectedStatsTimeframe = timeframe}
                            >
                                <div class="text-[#d1d4dc] text-xs opacity-60">{timeframe}</div>
                                <div class="text-sm {stats.changes[timeframe] >= 0 ? 'text-[#26a69a]' : 'text-[#ef5350]'}">
                                    {stats.changes[timeframe].toFixed(2)}%
                                </div>
                            </button>
                        {/each}
                    </div>
                </div>

                <!-- Transactions -->
                <div class="bg-[#1e222d] p-2.5 rounded-lg border border-[#2B2B43] transition-colors min-w-[400px]">
                    <div class="grid grid-cols-10 gap-4">
                        <div>
                            <div class="text-[#d1d4dc] text-xs opacity-60">TXNS</div>
                            <div class="text-[#d1d4dc] text-sm">{stats.transactions.total}</div>
                        </div>
                        <div>
                            <div class="text-[#d1d4dc] text-xs opacity-60">BUYS</div>
                            <div class="text-[#26a69a] text-sm">{stats.transactions.buys}</div>
                        </div>
                        <div>
                            <div class="text-[#d1d4dc] text-xs opacity-60">SELLS</div>
                            <div class="text-[#ef5350] text-sm">{stats.transactions.sells}</div>
                        </div>
                        <div>
                            <div class="text-[#d1d4dc] text-xs opacity-60">VOL</div>
                            <div class="text-[#d1d4dc] text-sm">{Intl.NumberFormat('en-US').format(Number(stats.transactions.volume.toFixed(2)))}</div>
                        </div>
                        <div>
                            <div class="text-[#d1d4dc] text-xs opacity-60">BUY VOL</div>
                            <div class="text-[#26a69a] text-sm">{Intl.NumberFormat('en-US').format(Number(stats.transactions.buyVolume.toFixed(2)))}</div>
                        </div>
                        <div>
                            <div class="text-[#d1d4dc] text-xs opacity-60">SELL VOL</div>
                            <div class="text-[#ef5350] text-sm">{Intl.NumberFormat('en-US').format(Number(stats.transactions.sellVolume.toFixed(2)))}</div>
                        </div>
                        <div>
                            <div class="text-[#d1d4dc] text-xs opacity-60">VOL DELTA</div>
                            <div class="text-sm {stats.transactions.volumeDelta >= 0 ? 'text-[#26a69a]' : 'text-[#ef5350]'}">{stats.transactions.volumeDelta >= 0 ? '+' : ''}{Intl.NumberFormat('en-US').format(Number(stats.transactions.volumeDelta.toFixed(2)))}</div>
                        </div>
                        <div>
                            <div class="text-[#d1d4dc] text-xs opacity-60">MAKERS</div>
                            <div class="text-[#d1d4dc] text-sm">{stats.transactions.makers}</div>
                        </div>
                        <div>
                            <div class="text-[#d1d4dc] text-xs opacity-60">BUYERS</div>
                            <div class="text-[#26a69a] text-sm">{stats.transactions.buyers}</div>
                        </div>
                        <div>
                            <div class="text-[#d1d4dc] text-xs opacity-60">SELLERS</div>
                            <div class="text-[#ef5350] text-sm">{stats.transactions.sellers}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div 
        bind:this={tableContainer}
        on:scroll={handleScroll}
        class="overflow-auto w-full border-[#2B2B43] bg-[#131722] transition-[height] duration-300 ease-in-out relative z-20"
        style="height: {isTableExpanded ? 'calc(70vh - 2rem)' : 'calc(30vh - 2rem)'};"
    >
        <table class="min-w-full">
            <thead class="sticky top-0 bg-[#1e222d]">
                <tr>
                    <th class="px-4 py-2 text-left text-[#d1d4dc]">Time</th>
                    <th class="px-4 py-2 text-left text-[#d1d4dc]">Wallet</th>
                    <th class="px-4 py-2 text-left text-[#d1d4dc]">Type</th>
                    <th class="px-4 py-2 text-left text-[#d1d4dc]">Price ($PSYCHO/$ETH)</th>
                    <th class="px-4 py-2 text-left text-[#d1d4dc]">Quantity</th>
                    <th class="px-4 py-2 text-left text-[#d1d4dc]">Transaction</th>
                </tr>
            </thead>
            <tbody>
                {#each visibleData as event, index}
                    <tr 
                        class="border-b border-[#2B2B43] hover:bg-[#1e222d] {event.isNew ? 'animate-new-row' : ''}"
                    >
                        <td class="px-4 py-2 text-[#d1d4dc]">{formatTime(event.time)}</td>
                        <td class="px-4 py-2">
                            <a 
                                href={`https://app.fuel.network/account/${event.recipient}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                class="text-[#26a69a] hover:text-[#2196f3]"
                            >
                                {event?.recipient?.slice(0, 8)}...
                            </a>
                        </td>
                        <td class="px-4 py-2">
                            <span class={event.is_buy ? 'text-[#26a69a]' : 'text-[#ef5350]'}>
                                {event.is_buy ? 'BUY' : 'SELL'}
                            </span>
                        </td>
                        <td class="px-4 py-2 text-[#d1d4dc]">
                            <span>{formatNumber(event.exchange_rate)}</span>
                            {#if index < visibleData.length - 1}
                                <span class={getPriceDirectionColor(event.exchange_rate, visibleData[index + 1].exchange_rate)}>
                                    {getPriceDirection(event.exchange_rate, visibleData[index + 1].exchange_rate)}
                                </span>
                            {/if}
                        </td>
                        {#if event.is_buy}
                            <td class="px-4 py-2 text-[#d1d4dc]">{formatTokenNumber(event.asset_0_in, event.asset_0_out, true)}</td>
                        {:else}
                            <td class="px-4 py-2 text-[#d1d4dc]">{formatTokenNumber(event.asset_0_in, event.asset_0_out, false)}</td>
                        {/if}
                       
                        <td class="px-4 py-2">
                            <a 
                                href={`https://app.fuel.network/tx/${event.transaction_id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                class="text-[#26a69a] hover:text-[#2196f3]"
                            >
                                {event.transaction_id.slice(0, 8)}...
                            </a>
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
        
        {#if loading}
            <div class="p-4 text-center text-[#d1d4dc]">
                Loading more data...
            </div>
        {/if}
    </div>
</div>

<style>
    @keyframes glow {
        0%, 100% { filter: drop-shadow(0 0 0.5rem #26a69a); }
        50% { filter: drop-shadow(0 0 2rem #26a69a); }
    }

    img {
        animation: glow 2s ease-in-out infinite;
    }

    .animate-glow {
        animation: textGlow 2s ease-in-out infinite;
    }

    @keyframes textGlow {
        0%, 100% { 
            text-shadow: 0 0 5px #26a69a, 0 0 10px #26a69a, 0 0 15px #26a69a;
            transform: scale(1);
        }
        50% { 
            text-shadow: 0 0 10px #26a69a, 0 0 20px #26a69a, 0 0 30px #26a69a;
            transform: scale(1.05);
        }
    }

    table {
        border-collapse: collapse;
        width: 100%;
    }

    th {
        font-weight: 500;
        font-size: 0.875rem;
    }

    td {
        font-size: 0.875rem;
    }

    tbody tr:hover {
        transition: background-color 0.2s ease;
    }

    .animate-spin {
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }

    .animate-new-row {
        animation: slideIn 0.5s ease-out;
        background-color: rgba(38, 166, 154, 0.1);
    }

    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateY(-20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .animate-new-row {
        animation: slideIn 0.5s ease-out, highlightFade 2s ease-out;
    }

    @keyframes highlightFade {
        0% {
            background-color: rgba(38, 166, 154, 0.2);
        }
        100% {
            background-color: transparent;
        }
    }

    input[type="checkbox"]:checked + div {
        box-shadow: 0 0 10px rgba(38, 166, 154, 0.3);
    }

    /* Prevent text selection while dragging */
    .cursor-ns-resize {
        user-select: none;
        -webkit-user-select: none;
    }
</style>
