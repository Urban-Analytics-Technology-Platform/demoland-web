<script lang="ts">
    import { allFactors, type FactorName } from "../constants";
    import { createEventDispatcher } from "svelte";
    export let activeFactor: FactorName;
    export let opacity: number;
    const dispatch = createEventDispatcher();

    function changeFactor() {
        dispatch("changeFactor", {});
    }
    function changeOpacity() {
        dispatch("changeOpacity", {});
    }
</script>

<div id="indicators">
    {#each allFactors as fact}
        {#if fact.name === "sig"}
            <div class="category-first">Input</div>
        {:else if fact.name === "air_quality"}
            <div class="category-second">Outputs</div>
        {/if}
        <label id={fact.name + "-label"}
            ><input
                bind:group={activeFactor}
                type="radio"
                on:change={changeFactor}
                value={fact.name}
            />{fact.short}</label
        ><br />
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

    div.category-first {
        margin-bottom: 5px;
        font-style: italic;
    }
    
    div.category-second {
        margin-top: 5px;
        margin-bottom: 5px;
        font-style: italic;
    }

    div#opacity-slider {
        margin-top: 10px;
    }
</style>
