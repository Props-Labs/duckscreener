<script lang="ts">
    import { onMount, onDestroy, tick } from 'svelte';
    import { getTradingData, convertTradingDataToChartData, type TimeFrame } from '$lib/services/data';
    import { createChart, ColorType } from 'lightweight-charts';
    import { createEventDispatcher } from 'svelte';
    
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

    const dispatch = createEventDispatcher();
    
    export let poolId: string;
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
            mode: 1,
            borderVisible: true,
            borderColor: '#2B2B43',
            textColor: '#d1d4dc',
            autoScale: true,
            alignLabels: true,
            formatPrice: (price: number) => {
                if (price < 0.000001) {
                    return price.toExponential(4);
                }
                return price.toFixed(9);
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

    async function loadChartData(timeFrame: TimeFrame, showFullScreenLoader = true) {
        try {
            if (showFullScreenLoader) {
                isLoading = true;
            }
            isRefreshing = !showFullScreenLoader;
            
            const newRawData = await getTradingData(poolId);
            
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
        if (isBuy) {
            const tokenOut = Number(outValue) / 1e9;
            return new Intl.NumberFormat('en-US').format(tokenOut);
        } else {
            const tokenIn = Number(inValue) / 1e9;
            return new Intl.NumberFormat('en-US').format(-tokenIn);
        }
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
                type: 'custom',
                formatter: (price: number) => {
                    if (price < 0.000001) {
                        return price.toExponential(4);
                    }
                    return price.toFixed(9);
                },
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
</script>

<div class="flex flex-col w-full h-full bg-[#131722] relative overflow-y-auto">
    {#if isLoading}
        <div class="absolute inset-0 bg-[#131722]/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div class="flex flex-col items-center">
                <div class="w-32 h-32 relative animate-bounce">
                    <img 
                        src="/duck.png" 
                        alt="Loading..." 
                        class="w-full h-full object-contain animate-pulse"
                    />
                    <div class="absolute inset-0 bg-gradient-to-t from-[#26a69a]/20 to-transparent animate-pulse"></div>
                </div>
                <div class="mt-4 text-[#d1d4dc] font-medium animate-pulse">
                    Loading Chart Data...
                </div>
                <div class="mt-2 text-[#26a69a] font-bold tracking-wider animate-glow">
                    #WeLikeTheDuck
                </div>
                <div class="mt-1 text-[#d1d4dc] text-xs opacity-60">
                    Made by @Bitcoinski
                </div>
            </div>
        </div>
    {/if}
    
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
