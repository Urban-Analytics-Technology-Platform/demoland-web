<script lang="ts">
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();

    dispatch("changeScenario", {});
</script>

<div id="calculating-cover">
<div id="calculating">
    CALCULATING!!! WAOW

    <br />

    <input type="button" value="CANCEL"
        on:click={() => dispatch("abort", {})}
    />
</div>
</div>

<style>
    div#calculating-cover {
        width: 100vw;
        height: 100vh;
        position: fixed;
        top: 0;
        left: 0;
        background-color: rgba(239, 239, 239, 0.7);
    }

    div#calculating {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        padding: 25px;
        background-color: #fff;
        border-radius: 10px;
        box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
    }
</style>
