<script lang="ts">
    import Chart from "chart.js/auto";
    import {
        type IndicatorName,
        allIndicators,
        type ScenarioName,
        allScenarios,
        minValues,
        maxValues,
        type CompareView,
    } from "../constants";
    import { makeColormap, getValues } from "../utils";
    import { onMount, onDestroy } from "svelte";
    export let activeIndicator: IndicatorName;
    export let scenarioName: ScenarioName;
    export let compareScenarioName: ScenarioName | null;
    export let compareView: CompareView;

    // Number of bars to use in the chart
    const nbars: number = 11;

    let chart: Chart | null = null;
    type ChartData = {
        colors: string[];
        labels: number[];
        counts: number[];
        datasets: any[];
        showLegend: boolean;
        tickStepSize: number;
    };

    // Function to manually calculate tick step size, because it seems that
    // chart.js's automatic calculation is not quite as polished as matplotlib.
    function calculateTickStepSize(max: number, min: number): number {
        let s = (max - min) / 4; // Assuming we want 5 ticks (ish)
        if (s < 0.5) return 0.5;
        if (s < 1) return 1;
        if (s > 10) {
            let orderOfMagnitude = 10 ** Math.floor(Math.log10(s));
            return Math.round(s / orderOfMagnitude) * orderOfMagnitude;
        }
        return Math.round(s);
    }

    // Pretty-print a number for the chart tick labels. Again, not as polished
    // as matplotlib
    function pretty(value: number | string) {
        if (typeof value === "string") return value;
        if (value >= 1000000) return `${value / 1000000}M`;
        if (value >= 1000) return `${value / 1000}K`;
        if (value <= -1000000) return `${value / 1000000}M`;
        if (value <= -1000) return `${value / 1000}K`;
        return value;
    }

    // TODO: Clean up code duplication!!
    // Generate data for the chart.
    function makeChartData(): ChartData {
        let colors: string[], rawValues: number[], min: number, max: number;

        // Calculate data to plot
        if (compareView === "original") {
            // Use numbers from the scenario being visualised
            colors = makeColormap(activeIndicator, nbars);
            rawValues = getValues(activeIndicator, scenarioName);
            min = minValues.get(activeIndicator);
            max = maxValues.get(activeIndicator);
        } else if (compareView === "other") {
            // Use numbers from the scenario being compared against
            colors = makeColormap(activeIndicator, nbars);
            rawValues = getValues(activeIndicator, compareScenarioName);
            min = minValues.get(activeIndicator);
            max = maxValues.get(activeIndicator);
        } else if (compareView === "difference") {
            // Calculate the differences between the compared scenarios and plot those
            if (compareScenarioName === null)
                throw new Error(
                    "compareScenarioName should not be null when compareView is 'difference'"
                );
            colors = makeColormap("diff", nbars);
            const scenValues = getValues(activeIndicator, scenarioName);
            const cmpScenValues = getValues(
                activeIndicator,
                compareScenarioName
            );
            rawValues = scenValues.map((value, i) => value - cmpScenValues[i]);
            max = Math.max(
                Math.abs(Math.min(...rawValues)),
                Math.abs(Math.max(...rawValues))
            );
            min = -max;
        }

        // Quantise data being plotted to 0 -> nbars-1. The second map here is
        // to ensure that the largest value gets rounded down to nbars-1
        // instead of nbars (which would be illegal).
        const intValues = rawValues
            .map((value) => Math.floor(((value - min) / (max - min)) * nbars))
            .map((value) => Math.min(value, nbars - 1));
        // Get the counts of each value (this data goes on the y-axis)
        const counts = new Array(nbars).fill(0);
        for (const value of intValues) {
            counts[value]++;
        }
        // Generate the x-axis values, which are 0.5 -> nbars - 0.5 in steps of
        // 1, then rescale back to the original range of indi values
        const labels = Array.from(
            { length: nbars },
            (_, i) => ((i + 0.5) * (max - min)) / nbars + min
        );

        // Generate first dataset to plot
        let datasets = [
            {
                label:
                    compareView === "difference"
                        ? "Difference"
                        : compareView === "original"
                        ? allScenarios.find((s) => s.name === scenarioName)
                              .short
                        : allScenarios.find(
                              (s) => s.name === compareScenarioName
                          ).short,
                data: counts,
                // TODO: chart.js uses the first color in this array for the
                // legend label, which is often not very useful.
                backgroundColor: colors,
                borderWidth: 0,
                grouped: false,
                order: 2, // larger number = below
                categoryPercentage: 1.0,
                barPercentage: 1.0,
            },
        ];

        // Generate second dataset to plot (only if compareView is 'original',
        // i.e. plot both scenarios being compared together)
        if (
            compareScenarioName !== null &&
            (compareView === "original" || compareView === "other")
        ) {
            const compareRawValues: number[] = getValues(
                activeIndicator,
                compareView === "original" ? compareScenarioName : scenarioName
            );
            const compareIntValues = compareRawValues.map((value) =>
                Math.round(((value - min) / (max - min)) * (nbars - 1))
            );
            const compareCounts = new Array(nbars).fill(0);
            for (const value of compareIntValues) {
                compareCounts[value]++;
            }
            datasets.push({
                label:
                    compareView === "original"
                        ? allScenarios.find(
                              (s) => s.name === compareScenarioName
                          ).short
                        : allScenarios.find((s) => s.name === scenarioName)
                              .short,
                data: compareCounts,
                // @ts-ignore backgroundColor can be string or string[]
                backgroundColor: "rgba(1, 1, 1, 0)",
                borderWidth: 1,
                borderColor: "#f00",
                barPercentage: 1,
                grouped: false,
                order: 1,
                categoryPercentage: 1.0,
            });
        }

        return {
            datasets: datasets,
            counts: counts,
            labels: labels,
            colors: colors,
            showLegend: compareScenarioName !== null,
            tickStepSize: calculateTickStepSize(max, min),
        };
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
                        display: chartData.showLegend,
                        labels: {
                            boxWidth: 20,
                            font: { family: "IBM Plex Sans" },
                        },
                    },
                },
            },
        });
    }

    function updateChart() {
        if (chart === null) return;
        const chartData = makeChartData();
        chart.data.datasets = chartData.datasets;
        chart.data.labels = chartData.labels;
        // @ts-ignore: stepSize only exists on linear scales, but TS can't infer that here
        chart.options.scales.x.ticks.stepSize = chartData.tickStepSize;
        chart.options.plugins.legend.display = chartData.showLegend;
        chart.update("none");
    }

    onMount(() => drawChart(makeChartData()));
    onDestroy(destroyChart);

    let indi = allIndicators.find((i) => i.name === activeIndicator);

    $: {
        activeIndicator, scenarioName, compareScenarioName, compareView;
        indi = allIndicators.find((i) => i.name === activeIndicator);
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
