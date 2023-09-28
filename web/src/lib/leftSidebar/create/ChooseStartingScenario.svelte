<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { allScenarios, scenarioName, compareScenarioName } from "src/stores";
    const dispatch = createEventDispatcher();
    dispatch("changeScenario", {});

    function setScenario(event: Event) {
        let button = event.target as HTMLButtonElement;
        $scenarioName = button.value;
        $compareScenarioName = null;
        dispatch("changeScenario", {});
    }
</script>

<h3>Step 1: Choose starting scenario</h3>

<div id="starting-scenario-buttons">
    {#each [...$allScenarios.entries()] as [name, scenario]}
        <button value={name} on:click={setScenario}>{scenario.metadata.long}</button>
    {/each}
</div>

<style>
    div#starting-scenario-buttons {
        display: flex;
        flex-direction: column;
        gap: 7px;
        align-items: center;
    }

    button {
        width: 100%;
        text-align: left;
        font-family: inherit;
        background-color: #fff;
        border: 1px solid #000000;
        border-radius: 5px;
        box-shadow: 0px 1px 0px rgba(0, 0, 0, 0.1);
        cursor: pointer;
        padding: 3px 5px;
    }

    button:hover {
        background-color: #f2f2f2;
        transition: background-color 0.1s ease-in-out;
    }

    button:active {
        background-color: #eaeaea;
        transition: none 0s;
    }

    h3 {
        font-size: 100%;
        font-weight: bold;
    }
</style>
