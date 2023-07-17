<script lang="ts">
    import Chart from "./Chart.svelte";
    import LayerSelector from "./LayerSelector.svelte";
    import Collapsible from "./Collapsible.svelte";
    import {
        type LayerName,
        type ScenarioName,
        type CompareView,
        allIndicators,
    } from "../constants";

    import "overlayscrollbars/overlayscrollbars.css";
    import { overlayScrollbars } from "../utils";
    import { onMount } from "svelte";

    export let activeLayer: LayerName;
    export let opacity: number;
    export let scenarioName: ScenarioName;
    export let compareScenarioName: ScenarioName | null;
    export let compareView: CompareView;

    // Events which need to bubble up to main App
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();
    function changeLayer() {
        dispatch("changeLayer", {});
    }
    function changeOpacity() {
        dispatch("changeOpacity", {});
    }

    onMount(() => {overlayScrollbars("right-container")});
</script>

<div id="right-container" class="data-overlayscrollbars-initialize">
    <div id="right-sidebar">
        <Collapsible title="Map values">
            <LayerSelector
                bind:activeLayer
                bind:opacity
                on:changeLayer={changeLayer}
                on:changeOpacity={changeOpacity}
            />
        </Collapsible>

        {#each allIndicators as indi}
            <Collapsible title={indi.short} collapsed={activeLayer !== "sig" && indi.name !== activeLayer}>
                <Chart
                    indicatorName={indi.name}
                    {scenarioName}
                    {compareView}
                    {compareScenarioName}
                />
            </Collapsible>
        {/each}
    </div>
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
    }

    div#right-sidebar {
        height: 100%;
        width: 100%;
        display: grid;
        grid-template-columns: 15px 225px;
        align-items: baseline;
    }
</style>
