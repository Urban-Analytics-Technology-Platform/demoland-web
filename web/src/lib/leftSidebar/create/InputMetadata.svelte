<script lang="ts">
    export let scenarioShort: string = "";
    export let scenarioDescription: string = "";
    export let calculationMethod: "azure" | "wasm" | "local" = "azure";
    import { config } from "src/data/config";

    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();

    // Check if the app is deployed on the server
    const deployed = window.location.href
        .toLowerCase()
        .includes(config.baseUrl.toLowerCase());
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

<b>Calculation method</b>
<select bind:value={calculationMethod}>
    <option value="azure">Azure REST API</option>
    {#if !deployed}
    <option value="local">Local REST API</option>
    {/if}
    <option value="wasm">WebAssembly</option>
</select>

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
