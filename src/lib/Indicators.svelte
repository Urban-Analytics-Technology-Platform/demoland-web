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
    <h2>View</h2>
    {#each allFactors as fact}
        <label
            ><input
                bind:group={activeFactor}
                type="radio"
                on:change={changeFactor}
                value={fact.name}
            />{fact.short}</label
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
    div#indicators {
        line-height: 20px;
    }

    div#indicators > label > input[type="radio"] {
        vertical-align: baseline;
        margin-right: 10px;
    }
</style>
