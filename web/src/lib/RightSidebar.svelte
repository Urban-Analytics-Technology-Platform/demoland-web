<script lang="ts">
    import Sidebar from "src/lib/Sidebar.svelte";
    import Chart from "src/lib/rightSidebar/Chart.svelte";
    import LayerSelector from "src/lib/rightSidebar/LayerSelector.svelte";
    import Collapsible from "src/lib/reusable/Collapsible.svelte";
    import {
        type LayerName,
        allIndicators,
    } from "src/constants";

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
</script>

<Sidebar>
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
</Sidebar>

<style>
    div#right-sidebar {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
</style>
