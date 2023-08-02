<script lang="ts">
    import {
        type Scenario,
        type MacroVar,
        type LayerName,
        engineGithubUrl,
    } from "../../constants";
    import JSZip from "jszip";
    import { allScenarios, rescale } from "../../scenarios";
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();

    let files: FileList | null = null;

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

    function createScenario(file: File) {
        return JSZip.loadAsync(file).then((zip) => {
            // Deal with folders which were manually compressed, which have
            // one extra level (inside x.zip is a folder called x)
            if (zip.file("changed.json") === null) {
                const directories = zip.folder(/./);
                if (directories.length === 1) {
                    zip = zip.folder(directories[0].name);
                }
            }
            const promises = [
                zip.file("metadata.json").async("string"),
                zip.file("changed.json").async("string"),
                zip.file("values.json").async("string"),
            ];
            return Promise.all(promises).then(
                ([metadataJson, changedJson, valuesJson]) => {
                    const metadata = JSON.parse(metadataJson);
                    const changed = JSON.parse(changedJson);
                    const values = JSON.parse(valuesJson);
                    const newScenario: Scenario = {
                        name: "",
                        short: "",
                        long: "",
                        description: [],
                        values: new Map(),
                        changed: new Map(),
                    };
                    newScenario.name = escapeHtml(metadata.name);
                    newScenario.short = escapeHtml(metadata.short);
                    newScenario.long = escapeHtml(metadata.long);
                    newScenario.description = escapeHtml(
                        metadata.description
                    ).split("\n");
                    for (const [oa, map] of Object.entries(changed)) {
                        newScenario.changed.set(oa, new Map());
                        for (const [key, value] of Object.entries(map)) {
                            newScenario.changed
                                .get(oa)
                                .set(key as MacroVar, value);
                        }
                    }
                    for (const [oa, map] of Object.entries(values)) {
                        newScenario.values.set(oa, new Map());
                        for (const [key, value] of Object.entries(map)) {
                            const layerName = key as LayerName;
                            newScenario.values
                                .get(oa)
                                .set(layerName, rescale(layerName, value));
                        }
                    }
                    return newScenario;
                }
            );
        });
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
            Promise.all(Array.from(files).map(createScenario)).then(
                (scenarios) => {
                    if (scenarios.length === 0) {
                        return;
                    }
                    for (const scenario of scenarios) {
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
                    }
                    dispatch("import", {name: scenarios[0].name});
                }
            );
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

    <h3>Using the Python engine yourself</h3>

    Blah Blah. Look at<a href={engineGithubUrl} target="_blank">GitHub</a>.
</div>

<style>
    h3 {
        font-size: 100%;
        font-weight: bold;
    }

    div#getfile-container {
        margin-top: 15px;
    }
</style>
