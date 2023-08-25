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
    // Controller to abort the fetch request if the user cancels. This is in
    // the global scope so that it can be accessed by the abort button, but
    // only initialised inside acceptChangesAndCalculate()
    let controller: AbortController;
    let signal: AbortSignal;

    function changeScenarioAndProceed() {
        dispatch("changeScenario", {});
        step = 2;
    }

    function handleApiResponse(response: Response, changedJson: string) {
        if (response.ok) {
            console.log(response);
            response.json().then((values: object) => {
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
            throw new Error("Failed to calculate scenario values from server");
        }
    }

    function handleError(error: Error) {
        if (error instanceof DOMException && error.name === "AbortError") {
            step = 2;
            console.log("Calculation aborted!");
        } else {
            step = 4;
            throw error;
        }
    }

    function acceptChangesAndCalculate() {
        const changedJson = changesToApiJson(getLocalChanges());
        step = 3;

        // Create a new Controller each time the button is pressed
        controller = new AbortController();
        signal = controller.signal;

        const url = window.location.href.includes("localhost")
            ? "http://localhost:5174" // launch with `npm run api`
            : "https://demoland-api.azurewebsites.net/"; // deployed to Azure

        fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: changedJson,
            signal: signal,
        }).then((resp) => handleApiResponse(resp, changedJson), handleError);
    }
</script>

Create your own scenario by modifying an existing one.

{#if step === 1}
    <ChooseStartingScenario
        bind:scenarioName
        on:changeScenario={changeScenarioAndProceed}
    />
{/if}

{#if step === 2}
    <input
        type="button"
        value="Back to scenario selection"
        on:click={() => step = 1}
    />
    <input
        type="button"
        value="Accept changes and calculate"
        on:click={acceptChangesAndCalculate}
    />
    <ModifyOutputAreas bind:clickedOAName bind:scenarioName />
{/if}

{#if step === 3}
    <CalculatingScreen on:abort={() => controller.abort()} />
{/if}

{#if step === 4}
    URK! FAILED!
{/if}
