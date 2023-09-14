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
    } from "src/lib/rightSidebar/chart";
    import { getValues } from "src/utils";
    import { onMount, onDestroy } from "svelte";
    export let indicatorName: IndicatorName;
    export let scenarioName: string;
    export let compareScenarioName: string | null;

    // Number of bars to use in the chart
    const nbars = 11;

    let chart: Chart | null = null;
    let compareChartStyle: "both" | "difference" = "both";

    function patchedGenerateLabels(chart: Chart, datasets: ChartDataset[]) {
        let labels = Chart.defaults.plugins.legend.labels.generateLabels(chart);
        if (compareScenarioName === null) {
            // labels[0] is the scatter plot showing the mean
            labels[0].lineDash = [6, 3];
            labels[0].strokeStyle = "#000000";
            labels[0].lineWidth = 1.5;
            // labels[1] is the bar plot
            labels[1].fillStyle =
                datasets[1].backgroundColor[Math.floor(nbars / 2)];
        } else {
            if (compareChartStyle === "both") {
                // labels[0] is the scatter plot showing the mean of the
                // scenario being compared against
                labels[0].lineDash = [6, 3];
                labels[0].strokeStyle = "#ff0000";
                labels[0].lineWidth = 1.5;
                // labels[1] is the scatter plot showing the mean of the main
                // scenario
                labels[1].lineDash = [6, 3];
                labels[1].strokeStyle = "#000000";
                labels[1].lineWidth = 1.5;

                // labels[2] is the bar plot for the scenario being compared
                // against (i.e. empty bars with red outline)
                labels[2].fillStyle = "#fff";
                // labels[3] is the main scenario being viewed
                labels[3].fillStyle =
                    datasets[3].backgroundColor[Math.floor(nbars / 2)];
            }
            // If chartStyle = "difference" we don't show a legend
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
                        display: showLegend,
                        labels: {
                            usePointStyle: true,
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
            nbars,
            compareChartStyle
        );
        chart.data.datasets = chartData.datasets;
        chart.data.labels = chartData.labels;
        // @ts-ignore: stepSize only exists on linear scales, but TS can't infer that here
        chart.options.scales.x.ticks.stepSize = chartData.tickStepSize;
        chart.options.plugins.legend.display = showLegend;
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
                nbars,
                compareChartStyle
            )
        );
    });
    onDestroy(destroyChart);

    let indi: Indicator = allIndicators.get(indicatorName);
    let values: number[];
    let cmpValues: number[];
    let changes: number[];
    let noChangesAtAll: boolean;
    let showLegend: boolean;
    let chartType: "single" | "compareBoth" | "compareDifference";
    let chartHeight: string;

    $: {
        // Chart should be updated whenever these variables are changed
        indicatorName, scenarioName, compareScenarioName, compareChartStyle;
        // Useful variable which we can use to keep track of what kind of chart is being shown
        chartType =
            compareScenarioName === null
                ? "single"
                : compareChartStyle === "both"
                ? "compareBoth"
                : "compareDifference";

        showLegend = chartType !== "compareDifference";
        chartHeight = chartType === "compareDifference" ? "128.6px" : "160px";
        updateChart();
        values = getValues(indicatorName, scenarioName);
        if (compareScenarioName !== null) {
            cmpValues = getValues(indicatorName, compareScenarioName);
            changes = [...values.map((x, i) => x - cmpValues[i])];
            noChangesAtAll = changes.filter((x) => x !== 0).length === 0;
        }
    }
</script>

<div class="chart-container">
    {#if compareScenarioName !== null}
        {#if noChangesAtAll}
            No changes.
        {:else}
            <div class="compare-toggle-grid">
            <input
                type="radio"
                bind:group={compareChartStyle}
                value="both"
                id="{indicatorName}-compare-both"
            />
            <label for="{indicatorName}-compare-both">Show both scenarios</label>
            <input
                type="radio"
                bind:group={compareChartStyle}
                value="difference"
                id="{indicatorName}-compare-difference"
            />
            <label for="{indicatorName}-compare-difference"
                >Show differences
            </label>
            {#if compareChartStyle === "difference"}
                <span></span>
                <span class="smaller">(Note that unchanged OAs are excluded from this
                breakdown.)</span>
            {/if}
            </div>
        {/if}
    {/if}

    <!-- Instead of using Svelte's {/if} here, we use CSS to hide it. This is
    intentional and is because of an odd interaction where if a chart says 'no
    changes', and the scenario selection is toggled back to a comparison where
    there are changes, the chart doesn't show up again. -->
    <div id="chart-container" class={noChangesAtAll ? "no-changes" : ""}>
        <div class="chart-canvas" style="height: {chartHeight}">
            <canvas id="chart-{indicatorName}" />
        </div>
        <div class="chart-pointers">
            <div class="chart-pointers-left">
                ← {chartType === "compareDifference"
                    ? indi.less_diff
                    : indi.less}
            </div>
            <div class="chart-pointers-right">
                {chartType === "compareDifference" ? indi.more_diff : indi.more}
                →
            </div>
        </div>
    </div>
</div>

<style>
    div.chart-pointers {
        display: flex;
    }
    div.chart-pointers-left {
        margin-right: auto;
    }
    div.chart-pointers-right {
        margin-left: auto;
    }

    div.compare-toggle-grid {
        display: grid;
        grid-template-columns: 35px 1fr;
        align-items: baseline;
    }
    div.no-changes {
        display: none;
    }

    label {
        font-size: 90%;
    }
    input {
        width: 12px;
        vertical-align: baseline;
        margin-left: 11px;
        margin-right: 9px;
    }
    input:checked + label {
        color: #000;
    }
    input:not(:checked) + label {
        color: #999;
    }
    span.smaller {
        font-size: 80%;
        font-style: italic;
    }
</style>
