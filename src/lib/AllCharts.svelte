<script lang="ts">
    import Chart from "chart.js/auto";
    import {
        type ScenarioName,
        allIndicators,
        type IndicatorName,
        type CompareView,
    } from "../constants";
    import { type ChartData, makeChartData, prettyLabel } from "../chart";
    export let scenarioName: ScenarioName;
    export let compareScenarioName: ScenarioName | null;
    export let compareView: CompareView;
    import { onMount, onDestroy } from "svelte";

    let charts = new Map<IndicatorName, Chart | null>();
    // Number of bars to use in the chart
    const nbars = 11;

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
                                callback: ((val) => prettyLabel(val as number, false)),
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
                            display: false,
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
            chart.options.plugins.legend.display = false;
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
