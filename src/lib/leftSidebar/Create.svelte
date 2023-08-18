<script lang="ts">
    export let clickedOAName: string | null;
    export let scenarioName: string | null;
    import ChooseStartingScenario from "./create/ChooseStartingScenario.svelte";
    import ModifyOutputAreas from "./create/ModifyOutputAreas.svelte";
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();

    let step: number = 1;

    function changeScenarioAndProceed() {
        dispatch("changeScenario", {});
        step = 2;
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
    <ModifyOutputAreas bind:clickedOAName bind:scenarioName />
{/if}
