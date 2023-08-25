<script lang="ts">
    export let clickedOAName: string | null;
    export let scenarioName: string | null;
    import ChooseStartingScenario from "./create/ChooseStartingScenario.svelte";
    import ModifyOutputAreas from "./create/ModifyOutputAreas.svelte";
    import CalculatingScreen from "./create/CalculatingScreen.svelte";
    import {
        getLocalChanges,
        changesToApiJson,
        createNewScenario,
    } from "./helpers";
    import { allScenarios } from "../../scenarios";
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();

    // Stage of the scenario creation process
    let step: number = 1;
    // Controller to abort the fetch request if the user cancels
    const controller = new AbortController();
    const signal = controller.signal;

    function changeScenarioAndProceed() {
        dispatch("changeScenario", {});
        step = 2;
    }

    function acceptChangesAndCalculate() {
        const changedJson = changesToApiJson(getLocalChanges());
        step = 3;

        const url = window.location.href.includes("localhost")
            ? "http://localhost:5174" // launch with `npm run api`
            : "https://demoland-api.azurewebsites.net/"; // deployed to Azure

        fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: changedJson,
            signal: signal,
        }).then((response) => {
            if (response.ok) {
                console.log(response);
                response.json().then((values) => {
                    console.log("Success!");
                    const changed = JSON.parse(changedJson);
                    const newScenario = createNewScenario(
                        "Custom scenario",
                        "Custom scenario-short",
                        "Custom scenario-long",
                        "Custom scenario-description",
                        changed,
                        values
                    );
                    // Check for name duplication
                    if ($allScenarios.has(newScenario.name)) {
                        let i = 1;
                        while ($allScenarios.has(`${newScenario.name}_${i})`)) {
                            i++;
                        }
                        newScenario.name = `${newScenario.name}_${i}`;
                    }
                    $allScenarios.set(newScenario.name, newScenario);
                    dispatch("import", { name: newScenario.name });
                });
            } else {
                step = 4;
                throw new Error(
                    "Failed to calculate scenario values from server"
                );
            }
        });
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
    <CalculatingScreen
        on:abort={() => {
            controller.abort();
            console.log("Aborted!");
            step = 2;
        }}
    />
{/if}

{#if step === 4}
    URK! FAILED!
{/if}
