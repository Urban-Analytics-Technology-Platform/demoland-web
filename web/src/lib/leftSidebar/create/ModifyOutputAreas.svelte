<script lang="ts">
    export let userChangesPresent: boolean;
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();

    import { onMount, onDestroy } from "svelte";
    import {
        allScenarios,
        scenarioName,
        customScenarioInProgress,
        clickedOAs,
    } from "src/stores";
    import { signatures, type MacroVar } from "src/constants";
    import {
        getLocalChanges,
        storeLocalChanges,
    } from "src/lib/leftSidebar/helpers";

    import Slider from "./Slider.svelte";

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
        console.log("Updating OA changes");
        const allChanges = getLocalChanges();
        if (!sigModified && !jobModified && !useModified && !greenModified) {
            // If no changes, remove it from the Map
            $clickedOAs.forEach((oa) => {
                allChanges.delete(oa.name);
            });
        } else {
            const thisChanges: Map<MacroVar, number | null> = new Map([
                ["signature_type", sigModified ? sig : null],
                ["job_types", jobModified ? job : null],
                ["use", useModified ? use : null],
                ["greenspace", greenModified ? green : null],
            ]);
            $clickedOAs.forEach((oa) => {
                allChanges.set(oa.name, thisChanges);
            });
        }
        storeLocalChanges(allChanges);
        userChangesPresent = true;
    }

    function loadOAChangesToUI(oas) {
        if (oas.length === 0) return;
        const oaName = oas[0].name;
        const oaChanges = getOAChanges(oaName);
        sig = oaChanges.get("signature_type");
        sigModified = sig !== null;
        job = oaChanges.get("job_types");
        jobModified = job !== null;
        use = oaChanges.get("use");
        useModified = use !== null;
        green = oaChanges.get("greenspace");
        greenModified = green !== null;
        baselineSig = getBaselineSig();
    }

    function getBaselineSig(): null | number | "different" {
        if ($clickedOAs.length === 0) {
            return null;
        } else if ($clickedOAs.length === 1) {
            const oaName = $clickedOAs[0].name;
            return $allScenarios
                .get("baseline")
                .values.get(oaName)
                .get("signature_type");
        } else {
            const oaNames = $clickedOAs.map((oa) => oa.name);
            const baselineSigs = oaNames.map((oaName) =>
                $allScenarios
                    .get("baseline")
                    .values.get(oaName)
                    .get("signature_type")
            );
            if (baselineSigs.every((sig) => sig === baselineSigs[0])) {
                return baselineSigs[0];
            } else {
                return "different";
            }
        }
    }

    // Load current scenario into local storage
    storeLocalChanges($allScenarios.get($scenarioName).changes);

    // Variables for OA modifiers
    let sig: number | null = null;
    let sigModified: boolean;
    let baselineSig: null | number | "different"; // Only shown when sigModified is false
    let job: number | null = null;
    let jobModified: boolean;
    let use: number | null = null;
    let useModified: boolean;
    let green: number | null = null;
    let greenModified: boolean;

    onMount(() => {
        $customScenarioInProgress = true;
    });
    onDestroy(() => {
        $customScenarioInProgress = false;
    });

    // Update values in dropdowns whenever clickedOAs is changed
    $: loadOAChangesToUI($clickedOAs);
</script>

<h3>Step 2: Modify output areas</h3>

<input
    type="button"
    value="Back to scenario selection"
    on:click={() => dispatch("returnToSelection", {})}
/>
<input
    type="button"
    value="Continue to add metadata"
    on:click={() => dispatch("proceedToMetadata", {})}
/>

{#if 0}
    <p>Currently selected OA: {"names"}</p>

    <div id="changes-grid">
        <label for="sig-modified">Signature</label>
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
            min={-1}
            max={1}
            defaultVal={0}
            step={0.01}
        />

        <Slider
            title="Building use"
            bind:modified={useModified}
            bind:value={use}
            on:modified={updateOAChanges}
            min={0}
            max={1}
            defaultVal={0}
            step={0.01}
        />

        <Slider
            title="Greenspace"
            bind:modified={greenModified}
            bind:value={green}
            on:modified={updateOAChanges}
            min={0}
            max={1}
            defaultVal={0}
            step={0.01}
        />
    </div>
{:else}
    {#each $clickedOAs as oa}
        <p class="no-bottom-margin">id: {oa.id}, name: {oa.name}</p>
    {/each}
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

    p.no-bottom-margin {
        margin-bottom: 0;
    }
</style>
