<script lang="ts">
    import Chart from "chart.js/auto";
    import {
        type IndicatorName,
        type Indicator,
        allIndicators,
    } from "src/constants";
    import {
        type ChartDataset,
        type ChartData,
        makeChartData,
        prettyLabel,
    } from "src/chart";
    import { getValues } from "src/utils";
    import { onMount, onDestroy } from "svelte";
    export let indicatorName: IndicatorName;
    export let scenarioName: string;
    export let compareScenarioName: string | null;

    // Number of bars to use in the chart
    const nbars = 11;

    let chart: Chart | null = null;

    // This bit of code replaces the colour of the legend label with the central
    // color of the dataset's backgroundColor (otherwise, by default it uses the
    // first colour, which is often too light). Largely adapted from
    // https://github.com/chartjs/Chart.js/issues/2651 but with some
    // modifications due to the updated Chart.js API.
    function patchedGenerateLabels(chart: Chart, datasets: ChartDataset[]) {
        let labels = Chart.defaults.plugins.legend.labels.generateLabels(chart);
        if (datasets.length === 1) {
            // Only one plot being shown
            labels[0].fillStyle =
                datasets[0].backgroundColor[Math.floor(nbars / 2)];
        } else {
            // Two plots being shown. The second one is the one with the solid
            // background, i.e. the one we need to change
            labels[1].fillStyle =
                datasets[1].backgroundColor[Math.floor(nbars / 2)];
        }
        return labels;
    }

    function destroyChart() {
        if (chart !== null) chart.destroy();
    }

    function drawChart(chartData: ChartData) {
        let canvas = document.getElementById(
            `chart-${indicatorName}`
        ) as HTMLCanvasElement | null;
        if (canvas === null) return;

        destroyChart();
        chart = new Chart(canvas, {
            type: "bar",
            data: {
                labels: chartData.labels,
                datasets: chartData.datasets,
            },
            options: {
                maintainAspectRatio: false,
                events: [],
                scales: {
                    x: {
                        type: "linear",
                        ticks: {
                            stepSize: chartData.tickStepSize,
                            callback: (val) =>
                                prettyLabel(
                                    val as number,
                                    compareScenarioName !== null
                                ),
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
                            generateLabels: (chart) =>
                                patchedGenerateLabels(
                                    chart,
                                    chartData.datasets
                                ),
                        },
                    },
                },
            },
        });
    }

    function updateChart() {
        if (chart === null) return;
        const chartData = makeChartData(
            indicatorName,
            scenarioName,
            compareScenarioName,
            nbars
        );
        chart.data.datasets = chartData.datasets;
        chart.data.labels = chartData.labels;
        // @ts-ignore: stepSize only exists on linear scales, but TS can't infer that here
        chart.options.scales.x.ticks.stepSize = chartData.tickStepSize;
        chart.options.plugins.legend.display = false;
        chart.options.plugins.legend.labels.generateLabels = (chart) =>
            patchedGenerateLabels(chart, chartData.datasets);
        noChangesAtAll =
            chartData.datasets.length === 1 &&
            chartData.datasets[0].data.filter((x) => x !== 0).length === 0;
        chart.update("none");
    }

    onMount(() => {
        drawChart(
            makeChartData(
                indicatorName,
                scenarioName,
                compareScenarioName,
                nbars
            )
        );
    });
    onDestroy(destroyChart);

    let indi: Indicator = allIndicators.get(indicatorName);
    let values: number[];
    let cmpValues: number[];
    let mean: number;
    let cmpMean: number;
    let diffMeanPct: number;
    let changes: number[];
    let meanChange: number;
    let noChangesAtAll: boolean;

    function getMean(xs: number[]) {
        return xs.reduce((a, b) => a + b, 0) / xs.length;
    }

    $: {
        indicatorName, scenarioName, compareScenarioName;
        updateChart();
        values = getValues(indicatorName, scenarioName);
        mean = getMean(values);
        if (compareScenarioName !== null) {
            cmpValues = getValues(indicatorName, compareScenarioName);
            cmpMean = getMean(cmpValues);
            diffMeanPct = ((mean - cmpMean) / cmpMean) * 100;
            changes = [...values.map((x, i) => x - cmpValues[i])];
            meanChange = getMean(changes);
            noChangesAtAll = changes.filter((x) => x !== 0).length === 0;
        }
    }
</script>

<div class="chart-container">
    {#if compareScenarioName === null}
        <p>
            Mean: {mean.toFixed(2)}
            {#if compareScenarioName !== null}({diffMeanPct >= 0
                    ? "+"
                    : "−"}{Math.abs(diffMeanPct).toFixed(1)}%){/if}
        </p>
    {:else if noChangesAtAll}
        <p>No changes.</p>
    {:else}
        <p>
            Mean change: {meanChange >= 0 ? "+" : "−"}{Math.abs(
                meanChange
            ).toFixed(2)} ({diffMeanPct >= 0 ? "+" : "−"}{Math.abs(
                diffMeanPct
            ).toFixed(1)}%)
        </p>
    {/if}
    <div id="chart-container" class={noChangesAtAll ? "hidden" : ""}>
        <div class="chart-canvas">
            <canvas id="chart-{indicatorName}" />
        </div>
        <div class="chart-pointers">
            <div class="chart-pointers-left">
                ← {compareScenarioName !== null ? indi.less_diff : indi.less}
            </div>
            <div class="chart-pointers-right">
                {compareScenarioName !== null ? indi.more_diff : indi.more} →
            </div>
        </div>
    </div>
</div>

<style>
    div.chart-canvas {
        height: 150px;
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

    div.chart-container > :first-child {
        margin-top: 0 !important;
    }
    div.chart-container > :last-child {
        margin-bottom: 0 !important;
    }

    div.hidden {
        display: none;
    }
</style>
