<script lang="ts">
    export let modified: boolean;
    export let value: number | null;
    export let title: string;
    export let min: number;
    export let max: number;
    export let step: number;

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
        min="{min}"
        max="{max}"
        step="{step}"
    />
    <input
        type="number"
        id="value"
        bind:value
        on:change={() => {
            dispatch("modified", {});
        }}
        min="{min}"
        max="{max}"
        step="{step}"
    />
{:else}
    <input
        type="range"
        id="range"
        value="0"
        disabled
        min="{min}"
        max="{max}"
        step="{step}"
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
