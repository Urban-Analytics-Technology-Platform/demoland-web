<script lang="ts">
    import { allIndicators, type Indicator } from "../indicators";
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
    export let indicatorValues: object | null = null;
    export let opacityScale: number = 1;
</script>

<div id="right-container">
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
        Opacity:
        <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            bind:value={opacityScale}
            on:input={update(false)}
        />
    </div>

    {#if indicatorValues !== null}
        <div id="values">
            <h2>{indicatorValues["OA11CD"]}</h2>
            {#each allIndicators as indi}
                {#if indi === currentIndicator}
                    <span
                        style={"font-weight: bold; color: " +
                            indicatorValues[`${indi}-color`]}
                        >{indi}: {indicatorValues[indi].toFixed(2)}</span
                    ><br />
                {:else}
                    {indi}: {indicatorValues[indi].toFixed(2)}<br />
                {/if}
            {/each}
        </div>
    {/if}
</div>

<style>
    div#right-container {
        --margin: 40px;
        box-sizing: border-box;
        position: absolute;
        height: min-content;
        width: 300px;
        top: var(--margin);
        right: var(--margin);
        margin: 0px;
        padding: 0px;
        z-index: 1;
    }

    div#indicators,
    div#values {
        border-radius: 10px;
        opacity: 90%;
        box-sizing: border-box;
        height: min-content;
        width: 300px;
        top: var(--margin);
        right: var(--margin);
        padding: 20px;
        background-color: #caf0fa; /* light blue */
        overflow-y: scroll;
        border: 1px solid black;
    }

    div#indicators {
        margin-bottom: 20px;
    }

    div#values {
        padding: 20px;
        min-height: 200px;
        max-height: 200px;
    }

    input[type="range"] {
        display: inline-block;
        vertical-align: middle;
    }
</style>
