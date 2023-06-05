<script lang="ts">
    import Chart from "chart.js/auto";
    import {
        type FactorName,
        allIndicators,
        type ScenarioName,
        type CompareView,
    } from "../constants";
    import { type ChartDataset, type ChartData, makeChartData } from "../chart";
    import { onMount, onDestroy } from "svelte";
    export let activeFactor: FactorName;
    export let scenarioName: ScenarioName;
    export let compareScenarioName: ScenarioName | null;
    export let compareView: CompareView;

    // Number of bars to use in the chart
    const nbars = 11;

    // Pretty-print a number for the chart tick labels. Again, not as polished
    // as matplotlib. Apart from changing millions and thousands into 'M' and
    // 'K', this also converts hyphens into proper minus signs.
    //
    // @param {number} value: The number to pretty-print
    // @param {boolean} withSign: Whether to include a plus sign for positive
    // values
    function pretty(value: number, withSign = false) {
        if (typeof value === "string") return value;
        if (value === 0) return "0";
        if (value >= 1000000)
            return `${withSign ? "+" : ""}${value / 1000000}M`;
        if (value >= 1000) return `${withSign ? "+" : ""}${value / 1000}K`;
        if (value <= -1000000) return `−${Math.abs(value / 1000000)}M`;
        if (value <= -1000) return `−${Math.abs(value / 1000)}K`;
        if (value >= 0) return `${withSign ? "+" : ""}${value}`;
        return `−${Math.abs(value)}`;
    }

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
            "chart"
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
                                pretty(
                                    val as number,
                                    compareView === "difference"
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
                        display:
                            compareScenarioName !== null &&
                            compareView !== "difference",
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
        if (activeFactor === "sig")
            throw new Error(
                "activeFactor should not be 'sig' (if it is, this block should not appear)"
            );
        const chartData = makeChartData(
            activeFactor,
            compareView,
            scenarioName,
            compareScenarioName,
            nbars
        );
        chart.data.datasets = chartData.datasets;
        chart.data.labels = chartData.labels;
        // @ts-ignore: stepSize only exists on linear scales, but TS can't infer that here
        chart.options.scales.x.ticks.stepSize = chartData.tickStepSize;
        chart.options.plugins.legend.display =
            compareScenarioName !== null && compareView !== "difference";
        chart.options.plugins.legend.labels.generateLabels = (chart) =>
            patchedGenerateLabels(chart, chartData.datasets);
        chart.update("none");
    }

    onMount(() => {
        if (activeFactor === "sig")
            throw new Error(
                "activeFactor should not be 'sig' (if it is, this block should not appear)"
            );
        drawChart(
            makeChartData(
                activeFactor,
                compareView,
                scenarioName,
                compareScenarioName,
                nbars
            )
        );
    });
    onDestroy(destroyChart);

    let indi = allIndicators.find((i) => i.name === activeFactor);

    $: {
        activeFactor, scenarioName, compareScenarioName, compareView;
        indi = allIndicators.find((i) => i.name === activeFactor);
        updateChart();
    }
</script>

<div id="chart-container">
    <h2>{indi.short}</h2>
    <div id="chart-canvas">
        <canvas id="chart" />
    </div>
    <div id="chart-pointers">
        <div id="chart-pointers-left">
            ← {compareView === "difference" ? indi.less_diff : indi.less}
        </div>
        <div id="chart-pointers-right">
            {compareView === "difference" ? indi.more_diff : indi.more} →
        </div>
    </div>
</div>

<style>
    div#chart-container {
        border-radius: 10px;
        opacity: 90%;
        padding: 20px;
        background-color: #ffffff;
        box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
        pointer-events: auto;
    }

    div#chart-canvas {
        height: 150px;
    }

    div#chart-pointers {
        display: flex;
    }
    div#chart-pointers-left {
        margin-right: auto;
    }
    div#chart-pointers-right {
        margin-left: auto;
    }

    div#chart-container > :first-child {
        margin-top: 0 !important;
    }
    div#chart-container > :last-child {
        margin-bottom: 0 !important;
    }
</style>
