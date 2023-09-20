<script lang="ts">
    import { createScenarioFromZip, allScenarios } from "src/utils/scenarios";
    import { createEventDispatcher } from "svelte";
    import ErrorScreen from "src/lib/reusable/ErrorScreen.svelte";
    import JSZip from "jszip";

    const dispatch = createEventDispatcher();

    let files: FileList | null = null;

    // Error handling
    let error: boolean = false; // Whether an error occurred
    let errorMessage: string = ""; // Error message to display
    function displayError(message: string) {
        error = true;
        errorMessage = message;
    }

    function cancel() {
        const target = document.getElementById(
            "select-files"
        ) as HTMLInputElement;
        target.value = "";
    }

    function process() {
        if (!files || files.length === 0) {
            return;
        }
        // Load in the scenarios
        const scenarioPromises = Promise.all(
            [...files].map((f) => {
                return JSZip.loadAsync(f).then((zip) =>
                    createScenarioFromZip(zip, true)
                );
            })
        );
        // If all of them succeeded, add them to the list of scenarios
        scenarioPromises
            .then((scenarios) => {
                // If nothing was imported
                if (scenarios.length === 0) {
                    return;
                }
                let lastScenarioName: string | null = null;
                // Loop over the ones that did get imported
                for (const scenario of scenarios) {
                    // Skip if there was an error
                    if (scenario === null) {
                        continue;
                    }
                    // Check for name duplication
                    if ($allScenarios.has(scenario.name)) {
                        let i = 1;
                        while ($allScenarios.has(`${scenario.name}_${i})`)) {
                            i++;
                        }
                        scenario.name = `${scenario.name}_${i}`;
                    }
                    console.log(scenario);
                    $allScenarios.set(scenario.name, scenario);
                    lastScenarioName = scenario.name;
                }
                // Display the last scenario on the map
                if (lastScenarioName) {
                    dispatch("import", { name: lastScenarioName });
                }
            })
            // If any of them failed, then display the error
            .catch((e) => {
                displayError(e.message);
                return [];
            });
    }
</script>

<div id="import-contents">
    If you have already modelled a custom scenario and saved the results, you
    can import it here to visualise the results.

    <h3>Choose one or more .zip files...</h3>
    <div id="getfile-container">
        <input
            id="select-files"
            type="file"
            accept="*.zip"
            multiple
            bind:files
        />

        <button on:click={() => cancel()}>Cancel</button>
        <button on:click={() => process()}>Import</button>
    </div>
</div>

{#if error}
    <ErrorScreen message={errorMessage} on:close={() => (error = false)} />
{/if}

<style>
    h3 {
        font-size: 100%;
        font-weight: bold;
    }

    div#getfile-container {
        margin-top: 15px;
    }
</style>
