<script lang="ts">
    export let clickedOAName: string | null;
    export let scenarioName: string | null;
    import ChooseStartingScenario from "./create/ChooseStartingScenario.svelte";
    import ModifyOutputAreas from "./create/ModifyOutputAreas.svelte";
    import { createEventDispatcher } from "svelte";
    import { getLocalChanges, changesToApiJson } from "./lsHelpers";
    const dispatch = createEventDispatcher();

    let step: number = 1;

    function changeScenarioAndProceed() {
        dispatch("changeScenario", {});
        step = 2;
    }

    function acceptChangesAndCalculate() {
        step = 3;
        const jsonBody = changesToApiJson(getLocalChanges());
        console.log(jsonBody);
        // TODO: send changes to server and get values
        // TODO: parse values
        // TODO: create a new Scenario (use code from Import.svelte)
    }
</script>

Create your own scenario by modifying an existing one.

<p style="color: red">TODO: buttons to move between stages</p>

{#if step === 1}
    <ChooseStartingScenario
        bind:scenarioName
        on:changeScenario={changeScenarioAndProceed}
    />
{/if}

{#if step === 2}
    <input
        type="button"
        value="Accept changes and calculate"
        on:click={acceptChangesAndCalculate}
    />
    <ModifyOutputAreas bind:clickedOAName bind:scenarioName />
{/if}

{#if step === 3}
    Success! We are now calculating what will happen ...
{/if}
