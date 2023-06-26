<script lang="ts">
    import {
        allInputs,
        type LayerName,
        allIndicators,
        signaturesUrl,
    } from "../constants";
    import Tooltip from "./Tooltip.svelte";
    import { createEventDispatcher } from "svelte";
    export let activeLayer: LayerName;
    export let opacity: number;
    const dispatch = createEventDispatcher();

    function changeLayer() {
        dispatch("changeLayer", {});
    }
    function changeOpacity() {
        dispatch("changeOpacity", {});
    }
</script>

<div id="indicators">
    <div class="category-first">Land use</div>
    {#each allInputs as inp}
        <label id={inp.name + "-label"}
            ><input
                bind:group={activeLayer}
                type="radio"
                on:change={changeLayer}
                value={inp.name}
            />{inp.short}
        </label>
        {#if inp.name === "sig"}
            <Tooltip --width="160px">
                <a slot="content" href={signaturesUrl} target="_blank">[?]</a>
                <span slot="description"
                    >A link to their descriptions on the Urban Grammar website.</span
                >
            </Tooltip>
        {/if}
        <br />
    {/each}

    <div class="category-second">Indicators</div>
    {#each allIndicators as indi}
        <label id={indi.name + "-label"}
            ><input
                bind:group={activeLayer}
                type="radio"
                on:change={changeLayer}
                value={indi.name}
            />{indi.short}
        </label>
        <br />
    {/each}

    <div id="opacity-slider">
        Opacity:
        <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            bind:value={opacity}
            on:input={changeOpacity}
        />
    </div>
</div>

<style>
    input[type="range"] {
        display: inline-block;
        vertical-align: middle;
        width: 140px;
    }

    div#indicators {
        line-height: 20px;
    }

    div#indicators > label > input[type="radio"] {
        vertical-align: baseline;
        margin-left: 10px;
        margin-right: 10px;
    }

    div#opacity-slider {
        margin-top: 10px;
    }

    div.category-first {
        margin-bottom: 5px;
        font-style: italic;
    }

    div.category-second {
        margin-top: 5px;
        margin-bottom: 5px;
        font-style: italic;
    }
</style>
