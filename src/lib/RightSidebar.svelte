<script lang="ts">
    import AllCharts from "./AllCharts.svelte";
    import Chart from "./Chart.svelte";
    import Indicators from "./Indicators.svelte";
    import Values from "./Values.svelte";
    import Collapsible from "./Collapsible.svelte";
    import {
        type FactorName,
        type ScenarioName,
        type CompareView,
        type Indicator,
        allIndicators,
    } from "../constants";

    // Events which need to bubble up to main App
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();
    function changeFactor() {
        dispatch("changeFactor", {});
    }
    function changeOpacity() {
        dispatch("changeOpacity", {});
    }

    export let activeFactor: FactorName;
    export let opacity: number;
    export let scenarioName: ScenarioName;
    export let compareScenarioName: ScenarioName | null;
    export let compareView: CompareView;
    export let clickedFeature: GeoJSON.Feature | undefined;

    let indi: Indicator;
    let oaName: string | null;
    $: {
        indi = allIndicators.find((i) => i.name === activeFactor);
        oaName = clickedFeature !== null ? clickedFeature.properties.OA11CD : null;
    }
</script>

<div id="right-container">
    <Collapsible title="Map values">
        <Indicators
            bind:activeFactor
            bind:opacity
            on:changeFactor={changeFactor}
            on:changeOpacity={changeOpacity}
        />
    </Collapsible>

    {#if activeFactor !== "sig"}
        <Collapsible title={indi.short}>
            <Chart
                {activeFactor}
                {scenarioName}
                {compareView}
                {compareScenarioName}
            />
        </Collapsible>
    {:else}
        <Collapsible title="Overview of all indicators">
            <AllCharts {scenarioName} {compareScenarioName} {compareView} />
        </Collapsible>
    {/if}

    {#if clickedFeature !== null}
        <Collapsible title="Output area: {oaName}">
            <Values
                {activeFactor}
                {compareView}
                {compareScenarioName}
                feature={clickedFeature}
            />
        </Collapsible>
    {/if}
</div>

<style>
    div#right-container {
        border-radius: 10px;
        opacity: 90%;
        padding: 20px 20px 10px 15px;
        background-color: #ffffff;
        pointer-events: auto;
        box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);

        min-height: min-content;
        max-height: calc(100vh - 50px);
        overflow-y: auto;

        display: grid;
        grid-template-columns: 15px 220px;
        align-items: baseline;
    }
</style>
