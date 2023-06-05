<script lang="ts">
    export let title: string;

    export let collapsed: boolean = false;

    function toggle() {
        collapsed = !collapsed;
    }
</script>

{#if collapsed}
    <div class="collapsible-toggle closed" on:click={toggle}>⏵</div>
    <div class="collapsible-content closed"><h2>{title}</h2></div>
{:else}
    <div class="collapsible-toggle opened" on:click={toggle}>⏷</div>
    <div class="collapsible-content opened"><h2>{title}</h2><slot></slot></div>
{/if}

<style>
    div.collapsible-toggle {
        font-size: 120%;
        width: 15px;
    }
    div.collapsible-content {
        width: 220px;
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
