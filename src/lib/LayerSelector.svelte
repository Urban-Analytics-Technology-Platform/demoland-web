<script lang="ts">
    import { allInputs, allIndicators, signaturesUrl } from "../constants";
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
            <a id="signatures-link" href={signaturesUrl} target="_blank"
                >[?]
                <span id="signatures-link-tooltip"
                    >A link to their descriptions on the Urban Grammar website.</span
                >
            </a>
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

    a#signatures-link {
        font-size: 80%;
        margin-left: 5px;
        position: relative; /* allows the tooltip to be placed absolutely */
    }

    span#signatures-link-tooltip {
        opacity: 0;
        transition: opacity 0.6s;

        color: #000;
        position: absolute;
        bottom: 18px;
        left: 0px;
        transform: translateX(-50%);
        width: 160px;
        background-color: #fff;
        line-height: 1.2;
        text-align: center;

        border-radius: 5px;
        padding: 1px 3px;
        box-shadow: 0 0 3px #999;
    }

    a#signatures-link:hover span#signatures-link-tooltip {
        opacity: 1;
    }
</style>
