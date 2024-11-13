<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { getTradingData, convertTradingDataToChartData, type TimeFrame } from '$lib/services/data';
    import { createChart, ColorType } from 'lightweight-charts';
    import { createEventDispatcher } from 'svelte';
    
    const dispatch = createEventDispatcher();
    
    export let poolId: string;
    let chart: any;
    let candlestickSeries: any;
    let selectedTimeFrame: TimeFrame = '1h';
    let chartContainer: HTMLElement;
    let isLoading = false;
    
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

    function handleResize() {
        if (chart && chartContainer) {
            const { width, height } = chartContainer.getBoundingClientRect();
            chart.applyOptions({ 
                width: width,
                height: height
            });
        }
    }

    async function loadChartData(timeFrame: TimeFrame) {
        try {
            isLoading = true;
            const rawData = await getTradingData(poolId);
            const candlesticks = await convertTradingDataToChartData(rawData, timeFrame);
            if (candlestickSeries) {
                candlestickSeries.setData(candlesticks);
                chart.timeScale().fitContent();
                
                if (candlesticks.length > 0) {
                    dispatch('priceUpdate', candlesticks[candlesticks.length - 1].close);
                }
            }
        } catch (error) {
            console.error('Error loading chart data:', error);
        } finally {
            isLoading = false;
        }
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
        
        window.addEventListener('resize', handleResize);
        handleResize();
    });

    onDestroy(() => {
        if (typeof window !== 'undefined') {
            window.removeEventListener('resize', handleResize);
        }
    });

    async function handleTimeFrameChange(event: Event) {
        const select = event.target as HTMLSelectElement;
        selectedTimeFrame = select.value as TimeFrame;
        await loadChartData(selectedTimeFrame);
    }
</script>

<div class="flex flex-col w-full h-full bg-[#131722] relative">
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
            </div>
        </div>
    {/if}
    
    <div class="p-4 flex items-center space-x-4">
        <select 
            value={selectedTimeFrame}
            on:change={handleTimeFrameChange}
            class="p-2 border rounded bg-[#2B2B43] text-[#d1d4dc] border-[#2B2B43]"
        >
            {#each timeFrameOptions as timeFrame}
                <option value={timeFrame}>{timeFrame}</option>
            {/each}
        </select>
        <slot name="toolbar" />
    </div>
    <div 
        bind:this={chartContainer} 
        class="flex-1 w-full"
    ></div>
</div>

<style>
    @keyframes glow {
        0%, 100% { filter: drop-shadow(0 0 0.5rem #26a69a); }
        50% { filter: drop-shadow(0 0 2rem #26a69a); }
    }

    img {
        animation: glow 2s ease-in-out infinite;
    }
</style>
