<script lang="ts">
    import { type Indicator } from "../indicators";
    export let currentIndicator: Indicator;
    export let data = null;
</script>

<div id="chart-container">
    <h2>Chart</h2>
    Current indicator: {currentIndicator}
    <div id="chart">
    {#if data !== null}
            Chart!
    {/if}
    </div>
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

div#chart {
    height: 150px;
}
</style>
