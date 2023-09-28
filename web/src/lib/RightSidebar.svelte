<script lang="ts">
    import Chart from "src/lib/rightSidebar/Chart.svelte";
    import LayerSelector from "src/lib/rightSidebar/LayerSelector.svelte";
    import Collapsible from "src/lib/reusable/Collapsible.svelte";
    import {
        type LayerName,
        allIndicators,
    } from "src/constants";
    import "overlayscrollbars/overlayscrollbars.css";
    import { overlayScrollbars } from "src/utils";
    import { onMount } from "svelte";

    export let activeLayer: LayerName;
    export let opacity: number;

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

        {#each [...allIndicators.entries()] as [indiName, indi]}
            <Collapsible title={indi.short} collapsed={activeLayer !== "signature_type" && indiName !== activeLayer}>
                <Chart
                    indicatorName={indiName}
                />
            </Collapsible>
        {/each}
    </div>
</div>

<style>
    div#right-container {
        border-radius: 10px;
        padding: 20px 20px 10px 15px;
        background-color: rgba(255, 255, 255, 0.9);
        pointer-events: auto;
        box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);

        min-height: min-content;
        max-height: calc(100vh - 50px);
        z-index: 1;
    }

    div#right-sidebar {
        display: grid;
        grid-template-columns: 15px 225px;
        align-items: baseline;
        margin: 0px;
    }
</style>
