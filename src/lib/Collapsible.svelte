<script lang="ts">
    import { slide } from "svelte/transition";
    import { quintOut } from "svelte/easing";

    import closeTriangle from "../assets/close.svg";
    import openTriangle from "../assets/open.svg";

    export let title: string;
    export let collapsed: boolean = false;

    function toggle() {
        collapsed = !collapsed;
    }
</script>

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
