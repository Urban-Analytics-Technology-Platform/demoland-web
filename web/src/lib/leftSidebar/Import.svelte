<script lang="ts">
    import {
        createNewScenario,
        type Metadata,
        type Changes,
        type Values,
        createChangesMap,
        createValuesMap,
    } from "src/lib/leftSidebar/helpers";
    import JSZip from "jszip";
    import { allScenarios } from "src/scenarios";
    import { type Scenario } from "src/constants";
    import { createEventDispatcher } from "svelte";
    import ErrorScreen from "src/lib/reusable/ErrorScreen.svelte";

    const dispatch = createEventDispatcher();

    let files: FileList | null = null;

    // Error handling
    let error: boolean = false; // Whether an error occurred
    let errorMessage: string = ""; // Error message to display
    function displayError(message: string) {
        error = true;
        errorMessage = message;
    }

    function escapeHtml(text: string): string {
        const map = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;",
            "/": "&#x2F;",
            "`": "&#x60;",
            "=": "&#x3D;",
        };
        return text.replace(/[&<>"'/`=]/g, (m) => map[m]);
    }

    /* Parse a string as JSON, but returning a promise instead. The source is
     * passed as an argument to make for more informative error reporting. This
     * can, for example, be a filename. */
    function parseJsonAsPromise(source: string, json: string): Promise<object> {
        try {
            const obj = JSON.parse(json);
            return Promise.resolve(obj);
        } catch (e) {
            return Promise.reject(
                `${source} could not be parsed as valid JSON: ${e.message}`
            );
        }
    }

    /* Generate a scenario from a zip file. */
    function createScenarioFromZip(file: File): Promise<null | Scenario> {
        function getContentsFromZip(
            zip: JSZip
        ): Promise<[object, object, object]> {
            // Correctly handle folders which were manually compressed. These
            // have one extra level (for example, inside x.zip will be a folder
            // called x).
            if (zip.file("changed.json") === null) {
                const directories = zip.folder(/./);
                if (directories.length === 1) {
                    zip = zip.folder(directories[0].name);
                }
            }
            // Parse a file
            function parseOneFile(fname: string): Promise<object> {
                const file = zip.file(fname);
                return file === null
                    ? Promise.reject(`The ${fname} file is missing.`)
                    : file
                          .async("string")
                          .then((file) => parseJsonAsPromise(fname, file));
            }
            return Promise.all([
                parseOneFile("metadata.json"),
                parseOneFile("changed.json"),
                parseOneFile("values.json"),
            ]);
        }

        /* Check that the actual JSON contents of the files match the expected
         * format. */
        function validateZipContents(
            scenarioData: [object, object, object]
        ): Promise<[Metadata, Changes, Values]> {
            const metadata = scenarioData[0];
            const changed = scenarioData[1];
            const values = scenarioData[2];
            // Check metadata
            for (const field of ["name", "short", "long", "description"]) {
                if (!Object.hasOwn(metadata, field)) {
                    return Promise.reject(
                        `The metadata.json file is missing the ${field} field.`
                    );
                }
                if (typeof metadata[field] !== "string") {
                    return Promise.reject(
                        `The ${field} field in metadata.json is not a string.`
                    );
                }
            }
            // TODO Validate changed and values.
            const changedMap = createChangesMap(changed);
            const valuesMap = createValuesMap(values);
            return Promise.resolve([
                metadata as Metadata,
                changedMap,
                valuesMap,
            ]);
        }

        function createScenario(
            scenarioData: [Metadata, Changes, Values]
        ): Scenario {
            return createNewScenario(
                escapeHtml(scenarioData[0].name),
                escapeHtml(scenarioData[0].short),
                escapeHtml(scenarioData[0].long),
                escapeHtml(scenarioData[0].description),
                scenarioData[1],
                scenarioData[2]
            );
        }

        return JSZip.loadAsync(file)
            .then(getContentsFromZip)
            .then(validateZipContents)
            .then(createScenario)
            .catch((e) => {displayError(e); return null;});
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
        } else {
            const scenarioPromises = Promise.all(
                Array.from(files).map(createScenarioFromZip)
            );
            scenarioPromises.then((scenarios) => {
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
            });
        }
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
