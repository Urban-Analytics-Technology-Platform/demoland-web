<script lang="ts">
    import { slide } from "svelte/transition";
    import { quintOut } from "svelte/easing";

    export let title: string;
    export let collapsed: boolean = false;

    function toggle() {
        collapsed = !collapsed;
    }
</script>

<label class="collapsible-toggle {collapsed ? 'closed' : 'opened'}" transition:slide={{ duration: 400, easing: quintOut }}><input type="button" on:click={toggle} />
    {collapsed ? '⏵' : '⏷'}
</label>
<label class="collapsible-title {collapsed ? 'closed' : 'opened'}" transition:slide={{ duration: 400, easing: quintOut }}><input type="button" on:click={toggle} />
    <h2>{title}</h2>
</label>
{#if !collapsed}
    <div class="collapsible-content opened" transition:slide={{ duration: 400, easing: quintOut }}>
        <slot />
    </div>
{/if}

<style>
    h2 {
        margin: 0px;
    }
    input {
        display: none;
    }
    label.collapsible-toggle {
        font-size: 120%;
        background: none;
        border: none;
        margin: 0px;
        padding: 0px;
    }
    label:hover {
        cursor: pointer;
    }

    .closed {
        color: #666;
    }

    label.collapsible-title {
        margin-bottom: 10px;
    }
    div.collapsible-content {
        grid-column: 2 / 3;
        margin-bottom: 10px;
    }
    div.collapsible-content > :first-child {
        margin-top: 0 !important;
    }
    div.collapsible-content > :last-child {
        margin-bottom: 0 !important;
    }
</style>
