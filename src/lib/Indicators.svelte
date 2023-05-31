<script lang="ts">
    import { allIndicators, type IndicatorName } from "../constants";
    import { createEventDispatcher } from "svelte";
    export let activeIndicator: IndicatorName;
    export let opacity: number;
    const dispatch = createEventDispatcher();

    function changeIndicator() {
        dispatch("changeIndicator", {});
    }
    function changeOpacity() {
        dispatch("changeOpacity", {});
    }
</script>

<div id="indicators">
    <h2>Indicator to visualise</h2>
    {#each allIndicators as indi}
        <label
            ><input
                bind:group={activeIndicator}
                type="radio"
                on:change={changeIndicator}
                value={indi.name}
            />{indi.short}</label
        ><br />
    {/each}
    <p>
        Opacity:
        <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            bind:value={opacity}
            on:input={changeOpacity}
        />
    </p>
</div>

<style>
    div#indicators {
        border-radius: 10px;
        opacity: 90%;
        padding: 20px;
        background-color: #ffffff;
        pointer-events: auto;
        box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
    }

    input[type="range"] {
        display: inline-block;
        vertical-align: middle;
        width: 140px;
    }

    div#indicators > :first-child {
        margin-top: 0 !important;
    }
    div#indicators > :last-child {
        margin-bottom: 0 !important;
    }
</style>
