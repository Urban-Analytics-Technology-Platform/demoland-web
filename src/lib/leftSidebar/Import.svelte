<script lang="ts">
    import { type Scenario, type MacroVar, type LayerName, engineGithubUrl } from "../../constants";
    import JSZip from "jszip";
    import { allScenarios } from "../../stores";

    function cancel() {
        const target = document.getElementById(
            "select-files"
        ) as HTMLInputElement;
        target.value = "";
    }

    function process() {
        const target = document.getElementById(
            "select-files"
        ) as HTMLInputElement;
        if (!target.files || target.files.length === 0) {
            return;
        }
        // Validation
        function createScenario(file: File) {
            JSZip.loadAsync(file).then((zip) => {
                // Deal with folders which were manually compressed, which have
                // one extra level (inside x.zip is a folder called x)
                if (zip.file("changed.json") === null) {
                    const directories = zip.folder(/./);
                    if (directories.length === 1) {
                        zip = zip.folder(directories[0].name);
                    }
                }
                const newScenario: Scenario = {
                    name: "",
                    short: "",
                    long: "",
                    description: [],
                    values: new Map(),
                    changed: new Map(),
                };
                // TODO: SANITISE INPUT!!!! THIS IS A SECURITY RISK!!!!
                zip.file("metadata.json").async("string").then((data) => {
                    const metadata = JSON.parse(data);
                    newScenario.name = metadata.name;
                    newScenario.short = metadata.short;
                    newScenario.long = metadata.long;
                    newScenario.description = metadata.description.split("\n");
                });
                zip.file("changed.json").async("string").then((data) => {
                    for (const [oa, map] of Object.entries(JSON.parse(data))) {
                        newScenario.changed.set(oa, new Map());
                        for (const [key, value] of Object.entries(map)) {
                            newScenario.changed.get(oa).set(key as MacroVar, value);
                        }
                    }
                });
                zip.file("values.json").async("string").then((data) => {
                    for (const [oa, map] of Object.entries(JSON.parse(data))) {
                        newScenario.values.set(oa, new Map());
                        for (const [key, value] of Object.entries(map)) {
                            newScenario.values.get(oa).set(key as LayerName, value);
                        }
                    }
                });
                $allScenarios.set(newScenario.name, newScenario);
            });
        }
        for (const file of target.files) {
            createScenario(file);
        }
    }
</script>

<div id="import-contents">
    If you have already modelled a custom scenario and saved the results, you
    can import it here to visualise the results.

    <h3>Choose one or more .zip files...</h3>
    <div id="getfile-container">
        <input id="select-files" type="file" accept="*.zip" multiple />

        <button on:click={() => cancel()}>Cancel</button>
        <button on:click={() => process()}>Import</button>
    </div>

    <h3>Using the Python engine yourself</h3>

    Blah Blah. Look at <a href={engineGithubUrl} target="_blank">GitHub</a>.
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
