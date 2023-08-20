<script lang="ts">
    export let modified: boolean;
    export let value: number | null;
    export let title: string;

    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();
</script>

<label for="job">{title}</label>
<input
    type="checkbox"
    id="job-modified"
    bind:checked={modified}
    on:change={() => {
        if (modified) {
            value = 0;
        }
        dispatch("modified", {});
    }}
/>
{#if modified}
    <input
        type="range"
        id="range"
        bind:value
        on:change={() => {
            dispatch("modified", {});
        }}
        min="0.00"
        max="1.00"
        step="0.01"
    />
    <input
        type="number"
        id="value"
        bind:value
        on:change={() => {
            dispatch("modified", {});
        }}
        min="0.00"
        max="1.00"
        step="0.01"
    />
{:else}
    <input
        type="range"
        id="range"
        value="0"
        disabled
        min="0.00"
        max="1.00"
        step="0.01"
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
