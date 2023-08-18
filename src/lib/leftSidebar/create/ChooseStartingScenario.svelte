<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { allScenarios } from "../../../scenarios";
    const dispatch = createEventDispatcher();
        dispatch("changeScenario", {});

    export let scenarioName: string | null;

    function setScenario(event: Event) {
        let button = event.target as HTMLButtonElement;
        scenarioName = button.value;
        dispatch("changeScenario", {});
    }
</script>

<h3>Step 1: choose starting scenario</h3>

{#each [...$allScenarios.entries()] as [name, scenario]}
    <button value={name} on:click={setScenario}>{scenario.long}</button>
{/each}

<style>
    button {
        width: 100%;
        text-align: left;
    }

    h3 {
        font-size: 100%;
        font-weight: bold;
    }
</style>
