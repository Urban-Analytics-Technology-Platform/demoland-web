<script lang="ts">
    import Chart from "chart.js/auto";
    import { onMount, onDestroy } from "svelte";
    export let data: { colors: string[]; values: number[]; counts: number[] };

    let chart: Chart = null;

    function pretty(value: number | string) {
        if (typeof value === "string") return value;
        if (value >= 1000000) return `${value / 1000000}M`;
        if (value >= 1000) return `${value / 1000}K`;
        return value;
    }

    function destroyChart() {
        if (chart !== null) chart.destroy();
    }

    function drawChart(chartData: { colors: string[]; values: number[]; counts: number[] }) {
        console.log(chartData);
        let canvas = document.getElementById("chart") as HTMLCanvasElement;
        destroyChart();
        chart = new Chart(canvas, {
            type: "bar",
            data: {
                labels: chartData.values,
                datasets: [
                    {
                        data: chartData.counts,
                        backgroundColor: chartData.colors,
                        borderWidth: 0,
                    },
                ],
            },
            options: {
                events: [],
                scales: {
                    x: {
                        type: "linear",
                        beginAtZero: false,
                        ticks: {
                            callback: (value) => {
                                return pretty(value);
                            },
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
                }
            },
        });
    }

    onMount(() => drawChart(data));
    onDestroy(destroyChart);

    $: drawChart(data);
</script>

<div id="chart-container">
    <h2>Chart</h2>
    <canvas id="chart" />
</div>

<style>
    div#chart-container {
        --margin: 40px;
        border-radius: 10px;
        box-sizing: border-box;
        position: absolute;
        height: min-content;
        width: 300px;
        bottom: var(--margin);
        right: var(--margin);
        margin: 0px;
        padding: 20px;
        z-index: 1;
        border: 1px solid black;
        background-color: #fad7f0; /* pink */
    }
</style>
