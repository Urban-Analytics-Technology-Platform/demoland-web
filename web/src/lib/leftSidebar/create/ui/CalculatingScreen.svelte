<script lang="ts">
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();
</script>

<div id="calculating-cover">
<div id="calculating">
    <p>Calculation in progress...</p>

    <input type="button" value="Cancel" id="cancel-calculation"
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

    div#calculating :first-child {
        margin-top: 0 !important;
    }

    div#calculating :last-child {
        margin-bottom: 0 !important;
    }

    input#cancel-calculation {
        width: 100%;
    }
</style>
