<script lang="ts">
    import ChooseStartingScenario from "src/lib/leftSidebar/create/ChooseStartingScenario.svelte";
    import ModifyOutputAreas from "src/lib/leftSidebar/create/ModifyOutputAreas.svelte";
    import InputMetadata from "src/lib/leftSidebar/create/InputMetadata.svelte";
    import CalculatingScreen from "src/lib/leftSidebar/create/CalculatingScreen.svelte";
    import ErrorScreen from "src/lib/reusable/ErrorScreen.svelte";
    import {
        type ValuesObject,
        type ScenarioChanges,
        type ScenarioObject,
        type Scenario,
    } from "src/constants";
    import { toChangesObject, fromScenarioObject } from "src/utils/scenarios";
    import {
        allScenarios,
        scenarioName,
        scaleFactors,
        validAreaNames,
        clickedOAs,
    } from "src/stores";
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
    // Changes that user has made relative to baseline
    let changes: ScenarioChanges = new Map();

    // Prompt user to confirm if they navigate away from this tab
    onDestroy(() => {
        if (userChangesPresent && window.confirm(userChangesPromptText)) {
            changes = new Map();
        }
    });
    // or if they return to step 1
    function returnToSelection() {
        if (userChangesPresent) {
            if (window.confirm(userChangesPromptText)) {
                changes = new Map();
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
        changes = new Map($allScenarios.get($scenarioName).changes);
    }

    function handleApiResponse(response: Response, changesJson: string) {
        if (response.ok) {
            response.json().then((values: ValuesObject) => {
                console.log("Successfully retrieved JSON from API backend");
                const obj: ScenarioObject = {
                    metadata: {
                        name: scenarioShort.replace(/\s/g, "_").toLowerCase(), // name
                        short: scenarioShort,
                        long: "Custom: " + scenarioShort,
                        description: scenarioDescription,
                    },
                    changes: JSON.parse(changesJson)["scenario_json"],
                    values: values,
                };
                const newScenario: Scenario = fromScenarioObject(
                    obj,
                    $scaleFactors,
                    $validAreaNames,
                    "custom scenario from API backend"
                );
                // Check for name duplication
                if ($allScenarios.has(newScenario.metadata.name)) {
                    let i = 1;
                    while (
                        $allScenarios.has(`${newScenario.metadata.name}_${i})`)
                    ) {
                        i++;
                    }
                    newScenario.metadata.name = `${newScenario.metadata.name}_${i}`;
                }
                $allScenarios.set(newScenario.metadata.name, newScenario);
                // Get rid of changes; this also ensures that the "are you
                // sure" confirmation prompt doesn't show up.
                userChangesPresent = false;
                changes = new Map();
                // Display the new scenario on the map.
                dispatch("import", { name: newScenario.metadata.name });
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
        const changedJson = JSON.stringify({
            scenario_json: toChangesObject(changes),
        });
        step = "calc"; // move on
        changes = new Map(); // reset changes
        $clickedOAs = [];  // deselect any OAs

        // Create a new Controller each time the button is pressed
        controller = new AbortController();
        signal = controller.signal;

        const url = window.location.href.toLowerCase().includes(
            "urban-analytics-technology-platform.github.io"
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
        bind:userChangesPresent
        bind:changes
        on:returnToSelection={returnToSelection}
        on:proceedToMetadata={() => (step = "metadata")}
    />
{/if}

{#if step === "metadata"}
    <InputMetadata
        bind:scenarioShort
        bind:scenarioDescription
        on:returnToModify={() => (step = "modify")}
        on:acceptChangesAndCalculate={acceptChangesAndCalculate}
    />
{/if}

{#if step === "calc"}
    <CalculatingScreen on:abort={() => controller.abort()} />
{/if}

{#if step === "error"}
    <ErrorScreen message={errorMessage} on:close={() => (step = "metadata")} />
{/if}
