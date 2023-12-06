<script lang="ts">
    export let backText: string;
    export let forwardText: string;

    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();
</script>

<div class="buttons">
    <button on:click={() => dispatch("backClick", {})} class="align-left">
        <span>←</span>
        <span>{backText}</span>
    </button>
    <button on:click={() => dispatch("forwardClick", {})} class="align-right">
        <span>{forwardText}</span>
        <span>→</span>
    </button>
</div>

<style>
    .buttons {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
    }

    button {
        font-family: inherit;
        width: 47%;
        white-space: normal;
        font-size: 85%;
        display: flex;
        gap: 5px;
        align-items: center;
    }

    .align-left {
        text-align: left;
    }

    .align-right {
        text-align: right;
    }
</style>
