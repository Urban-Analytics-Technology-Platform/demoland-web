<script lang="ts">
    import Chart from "./Chart.svelte";
    import Indicators from "./Indicators.svelte";
    import Values from "./Values.svelte";
    import Collapsible from "./Collapsible.svelte";
    import {
        type FactorName,
        type ScenarioName,
        type CompareView,
        allIndicators,
        type IndicatorName,
    } from "../constants";

    export let activeFactor: FactorName;
    export let opacity: number;
    export let scenarioName: ScenarioName;
    export let compareScenarioName: ScenarioName | null;
    export let compareView: CompareView;
    export let clickedFeature: GeoJSON.Feature | undefined;

    // Events which need to bubble up to main App
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();
    function changeFactor() {
        dispatch("changeFactor", {});
    }
    function changeOpacity() {
        dispatch("changeOpacity", {});
    }

    let oaName: string | null;
    $: {
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

    {#each allIndicators as indi}
        <Collapsible title={indi.short} collapsed={activeFactor !== "sig" && indi.name !== activeFactor}>
            <Chart
                indicatorName={indi.name}
                {scenarioName}
                {compareView}
                {compareScenarioName}
            />
        </Collapsible>
    {/each}

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
