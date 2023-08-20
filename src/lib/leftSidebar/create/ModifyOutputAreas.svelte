<script lang="ts">
    export let clickedOAName: string | null;
    export let scenarioName: string;

    import { allScenarios } from "../../../scenarios";
    import { signatures, type MacroVar } from "../../../constants";

    import Slider from "./Slider.svelte";

    function storeLocalChanges(map: Map<string, Map<MacroVar, number | null>>) {
        // calling JSON.stringify directly on a map-of-a-map doesn't work, so we
        // need to convert each inner map first
        const intermediateMap = new Map();
        for (const [key, value] of map.entries()) {
            intermediateMap.set(key, [...value.entries()]);
        }
        localStorage.setItem(
            "changed",
            JSON.stringify([...intermediateMap.entries()])
        );
    }

    function getLocalChanges(): Map<string, Map<MacroVar, number | null>> {
        const stringified = localStorage.getItem("changed");
        if (stringified === null) {
            return new Map();
        } else {
            const intermediateMap = new Map(JSON.parse(stringified));
            const map = new Map();
            for (const [key, val] of intermediateMap.entries()) {
                // @ts-ignore Cannot prove deserialisation is safe
                map.set(key, new Map(val));
            }
            return map;
        }
    }

    function getOAChanges(oaName: string): Map<MacroVar, number | null> {
        const changes = getLocalChanges();
        if (changes.has(oaName)) {
            return changes.get(oaName);
        } else {
            return new Map([
                ["signature_type", null],
                ["job_types", null],
                ["use", null],
                ["greenspace", null],
            ]);
        }
    }

    function updateOAChanges() {
        const allChanges = getLocalChanges();
        if (!sigModified && !jobModified && !useModified && !greenModified) {
            // If no changes, remove it from the Map
            allChanges.delete(clickedOAName);
        } else {
            const thisChanges: Map<MacroVar, number | null> = new Map([
                ["signature_type", sigModified ? sig : null],
                ["job_types", jobModified ? job : null],
                ["use", useModified ? use : null],
                ["greenspace", greenModified ? green : null],
            ]);
            allChanges.set(clickedOAName, thisChanges);
        }
        console.log(allChanges);
        storeLocalChanges(allChanges);
    }

    function loadOAChanges(oaName: string) {
        const oaChanges = getOAChanges(oaName);
        sig = oaChanges.get("signature_type");
        sigModified = sig !== null;
        job = oaChanges.get("job_types");
        jobModified = job !== null;
        use = oaChanges.get("use");
        useModified = use !== null;
        green = oaChanges.get("greenspace");
        greenModified = green !== null;
        baselineSig = clickedOAName === null ? null : getBaselineSig();
    }

    function getBaselineSig(): number {
        return $allScenarios
            .get("baseline")
            .values.get(clickedOAName)
            .get("signature_type");
    }

    // Load current scenario into local storage
    storeLocalChanges($allScenarios.get(scenarioName).changed);

    // Variables for OA modifiers
    let sig: number | null = null;
    let sigModified: boolean;
    let baselineSig: number; // Only shown when sigModified is false
    let job: number | null = null;
    let jobModified: boolean;
    let use: number | null = null;
    let useModified: boolean;
    let green: number | null = null;
    let greenModified: boolean;

    // Update values in dropdowns whenever clickedOAName is changed
    $: loadOAChanges(clickedOAName);
</script>

<h3>Step 2: modify output areas</h3>

<p>
    Currently selected OA: {clickedOAName === null ? "none" : clickedOAName}
</p>

{#if clickedOAName !== null}
    <div id="changes-grid">
        <label for="sig">Signature</label>
        <input
            type="checkbox"
            id="sig-modified"
            bind:checked={sigModified}
            on:change={() => {
                if (sigModified) {
                    sig = getBaselineSig();
                }
                updateOAChanges();
            }}
        />
        {#if sigModified}
            <select
                id="sig-dropdown"
                bind:value={sig}
                on:change={updateOAChanges}
            >
                {#each [...signatures.entries()] as [signatureId, signature]}
                    <option value={signatureId}
                        >{signatureId}: {signature.name}</option
                    >
                {/each}
            </select>
        {:else}
            <select id="sig-dropdown" value={baselineSig} disabled>
                {#each [...signatures.entries()] as [signatureId, signature]}
                    <option value={signatureId}
                        >{signatureId}: {signature.name}</option
                    >
                {/each}
            </select>
        {/if}

        <Slider
            title="Job types"
            bind:modified={jobModified}
            bind:value={job}
            on:modified={updateOAChanges}
        />

        <Slider
            title="Building use"
            bind:modified={useModified}
            bind:value={use}
            on:modified={updateOAChanges}
        />

        <Slider
            title="Greenspace"
            bind:modified={greenModified}
            bind:value={green}
            on:modified={updateOAChanges}
        />
    </div>
{:else}
    Click an output area to begin
{/if}

<style>
    h3 {
        font-size: 100%;
        font-weight: bold;
    }

    label {
        font-style: italic;
    }

    div#changes-grid {
        width: 100%;
        display: grid;
        grid-template-columns: max-content min-content 1fr 1fr;
        grid-column-gap: 2px;
        grid-row-gap: 5px;
        align-items: center;
    }

    select#sig-dropdown {
        grid-column: 3 / span 2;
    }
</style>
