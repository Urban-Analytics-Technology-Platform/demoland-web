<script lang="ts">
    export let scenarioShort: string = "";
    export let scenarioDescription: string = "";

    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();
</script>

<h3>Step 3: Input scenario metadata</h3>

<input
    type="button"
    value="Back to OA modification"
    on:click={() => dispatch("returnToModify")}
/>
<input
    type="button"
    value="Accept changes and calculate"
    on:click={() => dispatch("acceptChangesAndCalculate")}
/>
<input
    type="text"
    bind:value={scenarioShort}
    placeholder="Scenario title..."
/>
<textarea
    bind:value={scenarioDescription}
    placeholder="A longer textual description..."
    spellcheck="false"
/>

<style>
    h3 {
        font-size: 100%;
        font-weight: bold;
    }
</style>
