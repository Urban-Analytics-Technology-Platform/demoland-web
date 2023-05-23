<script lang="ts">
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();

    function recentre(_: Event) {
        dispatch("recentreEvent", {});
    }
</script>

<div id="recentre">
    <input type="button" value="Centre map" id="recentre" on:click={recentre} />
</div>

<style>
    div#recentre {
        margin-left: auto;
        margin-right: auto;
        pointer-events: auto;
    }
    input#recentre {
        font-size: 14px;
        text-decoration: underline;
        border-radius: 10px;
        opacity: 90%;
        box-sizing: border-box;
        padding: 5px;
        background-color: #e8e8e8; /* grey */
    }
</style>
