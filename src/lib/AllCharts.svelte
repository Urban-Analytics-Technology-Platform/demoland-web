<script lang="ts">
    import Chart from "chart.js/auto";
    import {
        type ScenarioName,
        allIndicators,
        type IndicatorName,
        type CompareView,
    } from "../constants";
    import { type ChartData, makeChartData } from "../utils";
    export let scenarioName: ScenarioName;
    export let compareScenarioName: ScenarioName | null;
    export let compareView: CompareView;
    import { onMount, onDestroy } from "svelte";

    // Pretty-print a number for the chart tick labels. Again, not as polished
    // as matplotlib
    // TODO: This code is duplicated in charts and allcharts. extract out or otherwise refactor
    const nbars = 11;
    function pretty(value: number | string) {
        if (typeof value === "string") return value;
        if (value >= 1000000) return `${value / 1000000}M`;
        if (value >= 1000) return `${value / 1000}K`;
        if (value <= -1000000) return `${value / 1000000}M`;
        if (value <= -1000) return `${value / 1000}K`;
        return value;
    }

    let charts = new Map<IndicatorName, Chart | null>();

    function destroyCharts() {
        for (const indi of allIndicators) {
            if (charts[indi.name]) {
                charts[indi.name].destroy();
            }
        }
    }

    function drawCharts(chartData: Map<IndicatorName, ChartData>) {
        let canvas = new Map<IndicatorName, HTMLCanvasElement | null>();
        for (const indi of allIndicators) {
            canvas[indi.name] = document.getElementById(
                `chart-${indi.name}`
            ) as HTMLCanvasElement | null;
        }

        destroyCharts();

        for (const indi of allIndicators) {
            if (canvas[indi.name] === null) return;
            charts[indi.name] = new Chart(canvas[indi.name], {
                type: "bar",
                data: {
                    labels: chartData[indi.name].labels,
                    datasets: chartData[indi.name].datasets,
                },
                options: {
                    maintainAspectRatio: false,
                    events: [],
                    scales: {
                        x: {
                            type: "linear",
                            ticks: {
                                stepSize: chartData[indi.name].tickStepSize,
                                callback: pretty,
                                maxRotation: 0,
                                minRotation: 0,
                                font: { family: "IBM Plex Sans" },
                            },
                            grid: {
                                display: false,
                            },
                        },
                        y: {
                            display: false,
                        },
                    },
                    plugins: {
                        legend: {
                            display: chartData[indi.name].showLegend,
                            labels: {
                                boxWidth: 20,
                                font: { family: "IBM Plex Sans" },
                            },
                        },
                    },
                },
            });
        }
    }

    function updateCharts() {
        for (const indi of allIndicators) {
            let chart = charts[indi.name];
            if (!chart) return;
            const chartData = makeChartData(
                indi.name,
                compareView,
                scenarioName,
                compareScenarioName,
                nbars
            );
            chart.data.datasets = chartData.datasets;
            chart.data.labels = chartData.labels;
            // @ts-ignore: stepSize only exists on linear scales, but TS can't infer that here
            chart.options.scales.x.ticks.stepSize = chartData.tickStepSize;
            chart.options.plugins.legend.display = chartData.showLegend;
            chart.update("none");
        }
    }

    onMount(() => {
        let chartData = new Map<IndicatorName, ChartData>();
        for (const indi of allIndicators) {
            chartData[indi.name] = makeChartData(
                indi.name,
                compareView,
                scenarioName,
                compareScenarioName,
                nbars
            )
        }
        drawCharts(chartData);
    });
    onDestroy(destroyCharts);

    $: {
        scenarioName, compareScenarioName, compareView;
        updateCharts();
    }
</script>

<div id="allchart-container">
    <h2>Overview of all indicators</h2>
    {#each allIndicators as indi}
        <h4>{indi.short}</h4>
        <div class="chart-canvas" id={`chart-canvas-${indi.name}`}>
            <canvas id={`chart-${indi.name}`} />
        </div>
        <div class="chart-pointers" id={`chart-pointers-${indi.name}`}>
            <div class="chart-pointers-left" id={`chart-pointers-left-${indi.name}`}>
                ← {indi.less}
            </div>
            <div class="chart-pointers-right" id={`chart-pointers-right-${indi.name}`}>
                {indi.more} →
            </div>
        </div>
    {/each}
</div>

<style>
    div#allchart-container {
        border-radius: 10px;
        opacity: 90%;
        padding: 20px;
        background-color: #ffffff;
        box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
        pointer-events: auto;
        max-height: 244px;
        overflow-y: auto;
    }

    div.chart-canvas {
        height: 110px;
    }

    div.chart-pointers {
        display: flex;
    }
    div.chart-pointers-left {
        margin-right: auto;
    }
    div.chart-pointers-right {
        margin-left: auto;
    }

    div#allchart-container > :first-child {
        margin-top: 0 !important;
    }
    div#allchart-container > :last-child {
        margin-bottom: 0 !important;
    }
</style>
