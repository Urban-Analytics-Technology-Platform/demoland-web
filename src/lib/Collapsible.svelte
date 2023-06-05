<script lang="ts">
    import { slide } from "svelte/transition";
    import { cubicOut } from "svelte/easing";

    export let title: string;
    export let collapsed: boolean = false;

    function toggle() {
        collapsed = !collapsed;
    }
</script>

{#if collapsed}
    <div class="collapsible-toggle closed" on:click={toggle}>⏵</div>
{:else}
    <div class="collapsible-toggle opened" on:click={toggle}>⏷</div>
{/if}
<div class="collapsible-title"><h2>{title}</h2></div>
{#if !collapsed}
    <div class="collapsible-content" transition:slide={{ duration: 400, easing: cubicOut }}>
        <slot />
    </div>
{/if}

<style>
    h2 {
        margin: 0px;
    }
    div.collapsible-toggle {
        font-size: 120%;
    }
    div.collapsible-content {
        grid-column: 2 / 3;
    }
    div.closed {
        color: #888;
    }
    div.collapsible-content > :first-child {
        margin-top: 0 !important;
    }
    div.collapsible-content > :last-child {
        margin-bottom: 0 !important;
    }
</style>
