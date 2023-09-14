<script lang="ts">
    export let modified: boolean;
    export let value: number | null;
    export let title: string;
    export let defaultVal: number;
    export let min: number;
    export let max: number;
    export let step: number;

    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();

    function dispatchModified() {
        dispatch("modified", {});
    }
</script>

<label for="{title}-modified">{title}</label>
<input
    type="checkbox"
    id="{title}-modified"
    bind:checked={modified}
    on:change={() => {
        if (modified) {
            // ^ this is the state before the change, so this branch
            // corresponds to unchecking it
            value = defaultVal;
        }
        dispatchModified();
    }}
/>
{#if modified}
    <input
        type="range"
        id="range"
        bind:value
        on:change={dispatchModified}
        {min}
        {max}
        {step}
    />
    <input
        type="number"
        id="value"
        bind:value
        on:input={() => {
            if (value > max) {
                value = max;
            } else if (value < min) {
                value = min;
            }
        }}
        on:change={() => {
            if (value > max) {
                value = max;
            } else if (value < min) {
                value = min;
            } else if (value === null) {
                value = defaultVal;
            }
            dispatchModified();
        }}
        {min}
        {max}
        {step}
    />
{:else}
    <input
        type="range"
        id="range"
        value={defaultVal}
        disabled
        {min}
        {max}
        {step}
    />
    <input type="number" id="value" value="" disabled />
{/if}

<style>
    label {
        font-style: italic;
    }
    input#range {
        min-width: 100px;
    }
    input#value {
        min-width: 50px;
    }
</style>
