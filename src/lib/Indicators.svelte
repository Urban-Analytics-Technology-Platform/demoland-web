<script lang="ts">
    import { allIndicators, type Indicator } from "../constants";
    import { createEventDispatcher } from "svelte";
    export let activeIndicator: Indicator;
    export let opacity: number;
    const dispatch = createEventDispatcher();

    function changeIndicator() {
        dispatch("changeIndicator", {
            indicator: activeIndicator,
        });
    }
    function changeOpacity() {
        dispatch("changeOpacity", {
            opacity: opacity,
        });
    }

    // TODO refactor this into constants.ts
    let indicatorTexts: object = {
        air_quality: "Air quality",
        house_price: "House prices",
        job_accessibility: "Job accessibility",
        greenspace_accessibility: "Greenspace accessibility",
    };
</script>

<div id="indicators">
    <h2>Indicator to visualise</h2>
    {#each allIndicators as indi}
        <label
            ><input
                bind:group={activeIndicator}
                type="radio"
                on:change={changeIndicator}
                value={indi}
            />{indicatorTexts[indi]}</label
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
        background-color: #caf0fa; /* light blue */
        border: 1px solid black;
        pointer-events: auto;
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
