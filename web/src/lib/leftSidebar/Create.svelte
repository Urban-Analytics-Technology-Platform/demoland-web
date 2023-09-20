<script lang="ts">
    export let clickedOAName: string | null;
    import ChooseStartingScenario from "src/lib/leftSidebar/create/ChooseStartingScenario.svelte";
    import ModifyOutputAreas from "src/lib/leftSidebar/create/ModifyOutputAreas.svelte";
    import CalculatingScreen from "src/lib/leftSidebar/create/CalculatingScreen.svelte";
    import ErrorScreen from "src/lib/reusable/ErrorScreen.svelte";
    import {
        clearLocalChanges,
        getLocalChanges,
        changesToApiJson,
    } from "src/lib/leftSidebar/helpers";
    import {
        type Scenario,
        allScenarios,
        createChangesMap,
        createValuesMap,
    } from "src/utils/scenarios";
    import { onDestroy, createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();

    // Stage of the scenario creation process
    let step: "choose" | "modify" | "metadata" | "calc" | "error" = "choose";
    // Only displayed if there is actually an error
    let errorMessage: string = "An error occurred.";
    // Controller to abort the fetch request if the user cancels. This is in
    // the global scope so that it can be accessed by the abort button, but
    // only initialised inside acceptChangesAndCalculate()
    let controller: AbortController;
    let signal: AbortSignal;
    // Metadata which the user can provide for the scenario
    let scenarioShort: string = "";
    let scenarioDescription: string = "";

    // Flag to keep track of whether the user has changed any of the inputs
    // relative to the base scenario they chose
    let userChangesPromptText: string =
        "Are you sure you want to go back? All changes will be lost.";
    let userChangesPresent: boolean = false;

    // Prompt user to confirm if they navigate away from this tab
    onDestroy(() => {
        if (userChangesPresent && window.confirm(userChangesPromptText)) {
            clearLocalChanges();
        }
    });
    // or if they return to step 1
    function returnToSelection() {
        if (userChangesPresent) {
            if (window.confirm(userChangesPromptText)) {
                clearLocalChanges();
                userChangesPresent = false;
                step = "choose";
            }
        } else {
            step = "choose";
        }
    }

    function changeScenarioAndProceed() {
        dispatch("changeScenario", {});
        step = "modify"; // move on to the next step
    }

    function handleApiResponse(response: Response, changedJson: string) {
        if (response.ok) {
            response.json().then((values: object) => {
                console.log("Success!");
                const changed = JSON.parse(changedJson);
                const newScenario: Scenario = {
                    name: scenarioShort.replace(/\s/g, "_").toLowerCase(), // name
                    short: scenarioShort,
                    long: "Custom: " + scenarioShort,
                    description: scenarioDescription,
                    changed: createChangesMap(changed),
                    values: createValuesMap(values, true),
                };
                // Check for name duplication
                if ($allScenarios.has(newScenario.name)) {
                    let i = 1;
                    while ($allScenarios.has(`${newScenario.name}_${i})`)) {
                        i++;
                    }
                    newScenario.name = `${newScenario.name}_${i}`;
                }
                $allScenarios.set(newScenario.name, newScenario);
                // Get rid of changes in localStorage; this also ensures that
                // the "are you sure" confirmation prompt doesn't show up.
                userChangesPresent = false;
                clearLocalChanges();
                // Display the new scenario on the map.
                dispatch("import", { name: newScenario.name });
            });
        } else {
            step = "error";
            errorMessage = `HTTP request to custom scenario server failed: received ${response.status} ${response.statusText}.`;
            // Give a helpful hint
            if (response.status === 500) {
                errorMessage +=
                    " (If you are running locally, did you start the backend up?)";
            }
            throw new Error(errorMessage);
        }
    }

    function handleError(error: Error) {
        if (error instanceof DOMException && error.name === "AbortError") {
            step = "metadata"; // just go back to the previous step
            console.log("Calculation aborted");
        } else {
            step = "error";
            errorMessage = error.message;
        }
    }

    function acceptChangesAndCalculate() {
        // TODO should check that metadata is not empty
        // or use a default value if it is

        const changedJson = changesToApiJson(getLocalChanges());
        step = "calc"; // move on

        // Create a new Controller each time the button is pressed
        controller = new AbortController();
        signal = controller.signal;

        const url = window.location.href.includes(
            "alan-turing-institute.github.io"
        )
            ? "https://demoland-api.azurewebsites.net/" // deployed to Azure
            : "/api/"; // Docker, or local dev: this is a proxy to the backend on localhost:5174

        fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: changedJson,
            signal: signal,
        })
            .then((resp) => handleApiResponse(resp, changedJson))
            .catch((err) => handleError(err));
    }
</script>

Create your own scenario by modifying an existing one.

{#if step === "choose"}
    <ChooseStartingScenario on:changeScenario={changeScenarioAndProceed} />
{/if}

{#if step === "modify"}
    <ModifyOutputAreas
        bind:clickedOAName
        bind:userChangesPresent
        on:returnToSelection={returnToSelection}
        on:proceedToMetadata={() => (step = "metadata")}
    />
{/if}

{#if step === "metadata"}
    <input
        type="button"
        value="Back to OA modification"
        on:click={() => (step = "modify")}
    />
    <input
        type="button"
        value="Accept changes and calculate"
        on:click={acceptChangesAndCalculate}
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
{/if}

{#if step === "calc"}
    <CalculatingScreen on:abort={() => controller.abort()} />
{/if}

{#if step === "error"}
    <ErrorScreen message={errorMessage} on:close={() => (step = "metadata")} />
{/if}
