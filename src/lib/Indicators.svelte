<script lang="ts">
    import { allIndicators, type Indicator } from "../constants";
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();

    function update(indicatorChanged: boolean) {
        const eventType = indicatorChanged
            ? "indicatorChange"
            : "opacityChange";
        return (_: Event) => {
            dispatch(eventType, {
                indicator: currentIndicator,
                opacity: opacityScale,
            });
        };
    }

    let indicatorTexts: object = {
        air_quality: "Air quality",
        house_price: "House prices",
        job_accessibility: "Job accessibility",
        greenspace_accessibility: "Greenspace accessibility",
    };
    export let currentIndicator: Indicator;
    export let opacityScale: number = 1;
</script>

<div id="indicators">
    <h2>Indicator to visualise</h2>
    {#each allIndicators as indi}
        <label
            ><input
                bind:group={currentIndicator}
                type="radio"
                on:change={update(true)}
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
            bind:value={opacityScale}
            on:input={update(false)}
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
    }

    div#indicators > :first-child {
        margin-top: 0 !important;
    }
    div#indicators > :last-child {
        margin-bottom: 0 !important;
    }
</style>
