<script lang="ts">
    import { slide } from "svelte/transition";
    import { quintOut } from "svelte/easing";

    import closeTriangle from "src/assets/close.svg";
    import openTriangle from "src/assets/open.svg";

    export let title: string;
    export let collapsed: boolean = false;

    function toggle() {
        collapsed = !collapsed;
    }
</script>

<div class="collapsible">
<label
    class="collapsible-toggle {collapsed ? 'closed' : 'opened'}"
    transition:slide={{ duration: 400, easing: quintOut }}
    ><input type="button" on:click={toggle} />
    <img
        src={collapsed ? closeTriangle : openTriangle}
        alt={collapsed ? "closed" : "open"}
        width="10px"
    />
</label>
<label
    class="collapsible-title {collapsed ? 'closed' : 'opened'}"
    transition:slide={{ duration: 400, easing: quintOut }}
    ><input type="button" on:click={toggle} />
    <h2>{title}</h2>
</label>
{#if !collapsed}
    <div
        class="collapsible-content opened"
        transition:slide={{ duration: 400, easing: quintOut }}
    >
        <slot />
    </div>
{/if}
</div>

<style>
    h2 {
        margin: 0px;
    }
    input {
        display: none;
    }
    label:hover {
        cursor: pointer;
    }
    img {
        padding-bottom: 0.5px;
    }
    .closed {
        color: #666;
    }

    div.collapsible {
        display: grid;
        grid-template-columns: 15px max-content;
        grid-row-gap: 10px;
        align-items: baseline;
        margin: 0px;
    }

    div.collapsible-content {
        grid-column: 2 / 3;
        margin-bottom: 15px;
    }
</style>
