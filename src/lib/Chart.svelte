<script lang="ts">
    import Chart from "chart.js/auto";
    import {
        type IndicatorName,
        allIndicators,
        type ScenarioName,
        minValues,
        maxValues,
    } from "../constants";
    import { makeColormap, getValues } from "../utils";
    import { onMount, onDestroy } from "svelte";
    export let activeIndicator: IndicatorName;
    export let scenarioName: ScenarioName;
    export let compareScenarioName: ScenarioName | null;

    // Number of bars to use in the chart
    const nbars: number = 10;

    let chart: Chart | null = null;
    type ChartData = {
        colors: string[];
        labels: number[];
        counts: number[];
        datasets: any[];
    };

    // Generate data for the chart.
    //
    // @param{IndicatorName} indi: The indicator that is being visualised right now.
    // @param{ScenarioName} scen: The primary scenario being visualised.
    // @param{ScenarioName | null} cmpScen: The primary scenario being compared
    // against. Null if no comparison is being made.
    //
    // The reason why we explicitly pass parameters here (even though we could
    // just take their values from the surrounding scope) is to enable reactive
    // updates when any of the variables change (using Svelte's $: label
    // syntax). For example, $: updateChart() will not fire when
    // activeIndicator is changed, but updateChart(activeIndicator, ...) will.
    function makeChartData(
        indi: IndicatorName,
        scen: ScenarioName,
        cmpScen: ScenarioName | null
    ): ChartData {
        const colors = makeColormap(indi, nbars);
        const rawValues: number[] = getValues(indi, scen);
        // quantise rawValues to 0 -> 19
        const min = minValues.get(indi);
        const max = maxValues.get(indi);
        const intValues = rawValues.map((value) =>
            Math.round(((value - min) / (max - min)) * (nbars - 1))
        );
        // get the counts of each value (y-axis)
        const counts = new Array(nbars).fill(0);
        for (const value of intValues) {
            counts[value]++;
        }
        // generate the x-axis values, which are 0 -> nbars-1 but rescaled back
        // to the original range of indi values
        const labels = Array.from({ length: nbars }, (_, i) => i).map(
            (value) => (value * (max - min)) / (nbars - 1) + min
        );

        let datasets = [
            {
                data: counts,
                backgroundColor: colors,
                borderWidth: 0,
                grouped: false,
                order: 2, // larger number = below
            },
        ];

        if (cmpScen !== null) {
            const compareRawValues: number[] = getValues(indi, cmpScen);
            const compareIntValues = compareRawValues.map((value) =>
                Math.round(((value - min) / (max - min)) * (nbars - 1))
            );
            const compareCounts = new Array(nbars).fill(0);
            for (const value of compareIntValues) {
                compareCounts[value]++;
            }
            datasets.push({
                data: compareCounts,
                // @ts-ignore backgroundColor can be string or string[]
                backgroundColor: "rgba(1, 1, 1, 0)",
                borderWidth: 3,
                borderColor: "#ff878d",
                barPercentage: 1,
                grouped: false,
                order: 1,
            });
        }

        return {
            datasets: datasets,
            counts: counts,
            labels: labels,
            colors: colors,
        };
    }

    function pretty(value: number | string) {
        if (typeof value === "string") return value;
        if (value >= 1000000) return `${value / 1000000}M`;
        if (value >= 1000) return `${value / 1000}K`;
        if (value <= -1000000) return `${value / 1000000}M`;
        if (value <= -1000) return `${value / 1000}K`;
        return value;
    }

    function destroyChart() {
        if (chart !== null) chart.destroy();
    }

    function drawChart(chartData: ChartData) {
        let canvas = document.getElementById(
            "chart"
        ) as HTMLCanvasElement | null;
        // DOM not yet created. If this check isn't present, then the $:
        // drawChart line leads to an error, since that is executed when the
        // page is first created
        if (canvas === null) return;

        destroyChart();
        chart = new Chart(canvas, {
            type: "bar",
            data: {
                labels: chartData.labels,
                datasets: chartData.datasets,
            },
            options: {
                events: [],
                scales: {
                    x: {
                        type: "linear",
                        beginAtZero: false,
                        ticks: {
                            callback: pretty,
                            maxRotation: 0,
                            minRotation: 0,
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
                    },
                },
            },
        });
    }

    function updateChart(
        indi: IndicatorName,
        scen: ScenarioName,
        cmpScen: ScenarioName | null
    ) {
        if (chart === null) return;
        const chartData = makeChartData(indi, scen, cmpScen);
        chart.data.datasets = chartData.datasets;
        chart.data.labels = chartData.labels;
        chart.update("none");
    }

    onMount(() =>
        drawChart(
            makeChartData(activeIndicator, scenarioName, compareScenarioName)
        )
    );
    onDestroy(destroyChart);

    $: updateChart(activeIndicator, scenarioName, compareScenarioName);
</script>

<div id="chart-container">
    <h2>Chart</h2>
    <canvas id="chart" />
    <div id="chart-pointers">
        <div id="chart-pointers-left">
            ← {allIndicators.find((i) => i.name === activeIndicator).less}
        </div>
        <div id="chart-pointers-right">
            {allIndicators.find((i) => i.name === activeIndicator).more} →
        </div>
    </div>
</div>

<style>
    div#chart-container {
        border-radius: 10px;
        padding: 20px;
        border: 1px solid black;
        background-color: #fad7f0; /* pink */
        pointer-events: auto;
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
