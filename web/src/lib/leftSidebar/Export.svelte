<script lang="ts">
    import geography from "src/data/geography.json";
    import JSZip from "jszip";
    import { saveAs } from "file-saver";
    import { allScenarios, unscale } from "src/utils/scenarios";
    import CloseButton from "src/lib/reusable/CloseButton.svelte";

    let exportDialogVisible: boolean = false;
    let exportScenarioNames: string[] = [];

    function exportScenarioResults() {
        if (exportScenarioNames.length === 0) {
            alert("Please select at least one scenario to export.");
            return;
        }

        for (const scenarioName of exportScenarioNames) {
            const zip = new JSZip();
            const scenario = $allScenarios.get(scenarioName);
            const changes = scenario.changes;
            const values = scenario.values;

            const changesObj = {};
            for (const [oa, m] of changes.entries()) {
                changesObj[oa] = {};
                for (const [mv, v] of m.entries()) {
                    changesObj[oa][mv] = v;
                }
            }

            const valuesObj = {};
            for (const [oa, m] of values.entries()) {
                valuesObj[oa] = {};
                for (const [layerName, val] of m.entries()) {
                    valuesObj[oa][layerName] = unscale(layerName, val);
                }
            }

            const changesJson = JSON.stringify(changesObj);
            const valuesJson = JSON.stringify(valuesObj);
            const metadataJson = JSON.stringify(scenario.metadata);

            zip.file(`changed.json`, changesJson);
            zip.file(`values.json`, valuesJson);
            zip.file(`metadata.json`, metadataJson);
            zip.file(`geometries.geojson`, JSON.stringify(geography));
            zip.generateAsync({ type: "blob" }).then(function (content) {
                saveAs(content, `${scenario.metadata.name}.scenario.zip`);
            });
        }
        exportDialogVisible = false;
    }

</script>

<span id="export-container">
    <button
        id="show-export"
        on:click={() => {
            exportDialogVisible = true;
        }}
    >
        Export...
    </button>
</span>

{#if exportDialogVisible}
    <button
        id="export-background-cover-button"
        on:click={() => {
            exportDialogVisible = false;
        }}
    >
        <div id="export-background-cover" />
    </button>
    <div id="export-selector">
        <div id="export-title-and-close">
            <div class="strong">Select scenarios to export...</div>
            <CloseButton
                --width="15px"
                on:click={() => {
                    exportDialogVisible = false;
                }}
            />
        </div>
        <div id="export-list">
            {#each [...$allScenarios.entries()] as [name, scenario]}
                <span>
                    <input
                        type="checkbox"
                        bind:group={exportScenarioNames}
                        value={name}
                        id={name}
                    />
                    <label for={name}>{scenario.short}</label>
                </span>
            {/each}
        </div>
        <button id="export" on:click={() => exportScenarioResults()}>
            Export
        </button>
    </div>
{/if}

<style>
    button#show-export {
        font-size: 80%;
        background-color: #ffffff;
        border: 1px solid #404040;
        color: #404040;
        border-radius: 4px;
        cursor: pointer;
    }
    button#show-export:hover {
        background-color: #f0f0f0;
    }

    button#export-background-cover-button {
        /* remove all styling. Could use display: contents instead. */
        padding: 0;
        margin: 0;
        background: none;
        border: none;
    }
    div#export-background-cover {
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
        background-color: #eee;
        opacity: 0.7;
        z-index: 4;
        cursor: pointer;
    }

    div#export-title-and-close {
        display: flex;
        gap: 15px;
        justify-content: space-between;
        align-items: center;
    }

    div#export-selector {
        width: max-content;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        padding: 10px;
        background-color: #ffffff;
        border-radius: 10px;
        box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
        z-index: 5;
    }

    div#export-list {
        padding-left: 5px;
        display: flex;
        flex-direction: column;
        gap: 2px;
        margin-top: 5px;
        margin-bottom: 10px;
    }
    div#export-list > span > input {
        margin-right: 5px;
    }
</style>
