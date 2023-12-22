<script lang="ts">
    import ChooseStartingScenario from "src/lib/leftSidebar/create/ChooseStartingScenario.svelte";
    import ModifyOutputAreas from "src/lib/leftSidebar/create/ModifyOutputAreas.svelte";
    import InputMetadata from "src/lib/leftSidebar/create/InputMetadata.svelte";
    import {
        CalculatingScreen,
        ErrorScreen,
    } from "src/lib/leftSidebar/create/ui";
    import {
        type ValuesObject,
        type ScenarioObject,
        type Scenario,
        config,
    } from "src/config";
    import { toChangesObject, fromScenarioObject } from "src/utils/scenarios";
    import {
        allScenarios,
        scenarioName,
        scaleFactors,
        validAreaNames,
        clickedOAs,
    } from "src/stores";
    import { onDestroy, createEventDispatcher } from "svelte";
    import { runScenario } from "src/lib/python/pyodide";
    const dispatch = createEventDispatcher();

    // Stage of the scenario creation process
    let step: "choose" | "modify" | "metadata" | "calc" | "error" = "choose";
    // Only displayed if there is actually an error
    let errorMessage: string = "An error occurred.";
    // Whether to run with Azure REST API, WASM, or local REST API
    let runner: "azure" | "wasm";
    // Controller to abort the fetch request if the user cancels. This is in
    // the global scope so that it can be accessed by the abort button, but
    // only initialised inside acceptChangesAndCalculate()
    let controller: AbortController;
    // Metadata which the user can provide for the scenario
    let scenarioShort: string = "";
    let scenarioDescription: string = "";

    // Flag to keep track of whether the user has changed any of the inputs
    // relative to the base scenario they chose
    let userChangesPromptText: string =
        "Are you sure you want to go back? All changes will be lost.";
    let userChangesPresent: boolean = false;

    // Deselect OAs if the user navigates away
    onDestroy(() => {
        $clickedOAs = [];
    });
    // or if they return to step 1
    function returnToSelection() {
        if (userChangesPresent) {
            if (window.confirm(userChangesPromptText)) {
                userChangesPresent = false;
                $clickedOAs = [];
                step = "choose";
                // Reset scenario name to default
                $scenarioName = config.referenceScenarioObject.metadata.name;
                dispatch("changeScenario");
            }
        } else {
            $clickedOAs = [];
            step = "choose";
        }
    }

    function changeScenario() {
        // Change the scenario on the map, but don't proceed
        dispatch("changeScenario", {});
        $clickedOAs = []; // deselect any OAs
    }
    function changeScenarioAndProceed() {
        // Change the scenario on the map, and proceed to the next step
        changeScenario();
        step = "modify";
    }

    function handleResult(values: ValuesObject, changesJson: string) {
        console.log("handleResult called");
        const obj: ScenarioObject = {
            metadata: {
                name: scenarioShort.replace(/\s/g, "_").toLowerCase(),
                short: scenarioShort,
                long: "Custom: " + scenarioShort,
                description: scenarioDescription,
            },
            changes: JSON.parse(changesJson)["scenario_json"],
            values: values,
        };
        console.log("obj", obj);
        const newScenario: Scenario = fromScenarioObject(
            obj,
            $scaleFactors,
            $validAreaNames,
            "custom scenario"
        );
        console.log("newScenario", newScenario);
        // Check for name duplication
        if ($allScenarios.has(newScenario.metadata.name)) {
            let i = 1;
            while ($allScenarios.has(`${newScenario.metadata.name}_${i})`)) {
                i++;
            }
            newScenario.metadata.name = `${newScenario.metadata.name}_${i}`;
        }
        $allScenarios.set(newScenario.metadata.name, newScenario);
        // Suppress "are you sure" confirmation prompt
        userChangesPresent = false;
        // Display the new scenario on the map.
        dispatch("import", { name: newScenario.metadata.name });
    }

    function handleApiResponse(response: Response, changesJson: string) {
        if (response.ok) {
            response.json().then((values) => handleResult(values, changesJson));
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
            scenario_json: toChangesObject(
                $allScenarios.get($scenarioName).changes
            ),
            model_identifier: config.modelIdentifier,
        });
        console.log("changedJson", changedJson);
        step = "calc"; // move on
        $clickedOAs = []; // deselect any OAs

        // Create a new Controller each time the button is pressed
        controller = new AbortController();

        console.log("Running with runner", runner);

        // WASM
        if (runner === "wasm") {
            runScenario(changedJson)
                .then((result) => {
                    console.log("result", result);
                    if (result.error) {
                        handleError(new Error(result.error));
                    } else {
                        console.log(result);
                        handleResult(result, changedJson);
                        console.log("scenario result is ", result);
                    }
                })
                .catch((err) => handleError(err));
        } else if (runner === "azure" || runner === "local") {
            // REST API
            const url =
                runner === "azure"
                    ? config.webApiUrl // deployed to Azure
                    : "/api/"; // Docker, or local dev: this is a proxy to the backend on localhost:5174
            fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: changedJson,
                signal: controller.signal,
            })
                .then((resp) => handleApiResponse(resp, changedJson))
                .catch((err) => handleError(err));
        }
    }
</script>

Create your own scenario by modifying an existing one.

{#if step === "choose"}
    <ChooseStartingScenario
        on:changeScenario={changeScenario}
        on:changeScenarioAndProceed={changeScenarioAndProceed}
    />
{/if}

{#if step === "modify"}
    <ModifyOutputAreas
        bind:userChangesPresent
        on:returnToSelection={returnToSelection}
        on:changesUpdated={() => {
            dispatch("changesUpdated");
        }}
        on:proceedToMetadata={() => (step = "metadata")}
    />
{/if}

{#if step === "metadata"}
    <InputMetadata
        bind:scenarioShort
        bind:scenarioDescription
        bind:calculationMethod={runner}
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
