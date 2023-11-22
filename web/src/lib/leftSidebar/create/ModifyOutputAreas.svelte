<script lang="ts">
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();

    import Slider from "./Slider.svelte";
    import { onMount, onDestroy } from "svelte";
    import {
        allScenarios,
        customScenarioInProgress,
        clickedOAs,
    } from "src/stores";
    import {
        type MacroVar,
        type ScenarioChanges,
        config,
    } from "src/data/config";

    // The actual changes
    export let changes: ScenarioChanges;
    // Flag to determine whether changes were made relative to the scenario the
    // user started from.
    export let userChangesPresent: boolean;

    // Initialisation code
    let mounted = false;
    onMount(() => {
        $customScenarioInProgress = true;
        mounted = true;
    });
    onDestroy(() => {
        $customScenarioInProgress = false;
    });

    function getReferenceSig(oaName: string): number {
        return $allScenarios
            .get(config.referenceScenarioObject.metadata.name)
            .values.get(oaName)
            .get("signature_type");
    }

    // Get changes belonging to a single OA. If none, return null for all
    // editable layers
    function getSingleOAChanges(
        oaName: string
    ): Map<MacroVar | "reference_sig", number | null> {
        const hasChanges = changes.has(oaName);
        const thisChanges = changes.get(oaName);
        return new Map([
            [
                "signature_type",
                hasChanges ? thisChanges.get("signature_type") : null,
            ],
            ["job_types", hasChanges ? thisChanges.get("job_types") : null],
            ["use", hasChanges ? thisChanges.get("use") : null],
            ["greenspace", hasChanges ? thisChanges.get("greenspace") : null],
            ["reference_sig", getReferenceSig(oaName)],
        ]);
    }

    // Update changes for all selected OAs from the slider
    function updateOAChanges() {
        if (!sigModified && !jobModified && !useModified && !greenModified) {
            // If no changes, remove it from the Map
            $clickedOAs.forEach((oa) => {
                changes.delete(oa.name);
            });
        } else {
            const userSetChanges: Map<MacroVar, number | null> = new Map([
                ["signature_type", sigModified ? sig : null],
                ["job_types", jobModified ? job : null],
                ["use", useModified ? use : null],
                ["greenspace", greenModified ? green : null],
            ]);
            // If there's only one clicked OA, then we want whatever's shown to
            // apply to that OA immediately.
            if ($clickedOAs.length === 1) {
                $clickedOAs.forEach((oa) => {
                    changes.set(oa.name, userSetChanges);
                });
            }
            // If there is more than one clicked OA, then we only want to
            // update any of the macrovariable inputs that are not `null`.
            else if ($clickedOAs.length > 1) {
                $clickedOAs.forEach((oa) => {
                    const thisOAChanges = getSingleOAChanges(oa.name);
                    userSetChanges.forEach((macroVarValue, macroVar) => {
                        if (macroVarValue !== null) {
                            thisOAChanges.set(macroVar, macroVarValue);
                        }
                    });
                    thisOAChanges.delete("reference_sig");
                    changes.set(oa.name, thisOAChanges as Map<MacroVar, number>);
                });
            }
        }
        const changesAsText =
            changes.size === 0
                ? "No changes"
                : [...changes.entries()]
                      .map(([oaName, thisOAChanges]) => {
                          return (
                              oaName +
                              ": " +
                              [...thisOAChanges.entries()]
                                  .map(([macroVar, value]) => {
                                      return (
                                          macroVar +
                                          ": " +
                                          String(value).padEnd(4, " ")
                                      );
                                  })
                                  .join("; ")
                          );
                      })
                      .join("\n");
        console.log('Updated \'changes\' to:\n', changesAsText);
        userChangesPresent = true;
    }

    // Determine what should be shown in the UI based on the current changes of
    // all the clicked OAs
    // We call this with $clickedOAs (instead of just using it directly in the
    // function body) to make sure that Svelte reruns this code whenever OAs
    // are selected.
    // TODO: Fix ugly code repetition (!)
    function loadOAChangesToUI(oas: Array<{ name: string }>) {
        if (oas.length === 0) return;
        else if (oas.length === 1) {
            // Exactly one OA selected
            const oaName = oas[0].name;
            const oaChanges = getSingleOAChanges(oaName);
            sig = oaChanges.get("signature_type");
            sigModified = sig !== null;
            job = oaChanges.get("job_types");
            jobModified = job !== null;
            use = oaChanges.get("use");
            useModified = use !== null;
            green = oaChanges.get("greenspace");
            greenModified = green !== null;
            referenceSig = oaChanges.get("reference_sig");
            // Update sliders as well
            console.log(sig);
            console.log(referenceSig);
            jobMin = config.signatures[sig || referenceSig].job_d1;
            jobMax = config.signatures[sig || referenceSig].job_d9;
            useMin = config.signatures[sig || referenceSig].use_d1;
            useMax = config.signatures[sig || referenceSig].use_d9;
        } else {
            // More than one OA selected
            const allSigs: Array<number | null> = oas.map((oa) =>
                getSingleOAChanges(oa.name).get("signature_type")
            );
            const allReferenceSigs: Array<number> = oas.map((oa) =>
                getSingleOAChanges(oa.name).get("reference_sig")
            );
            // If none of the values were changed, check if the reference values
            // are all the same. If so, display that
            if (allSigs.every((s) => s === null)) {
                sigModified = false;
                if (allReferenceSigs.every((s) => s === allReferenceSigs[0])) {
                    referenceSig = allReferenceSigs[0];
                } else {
                    referenceSig = null;
                }
            }
            // If some of the values were changed, but not all, display an unchecked checkbox
            else if (
                allSigs.some((s) => s !== null) &&
                allSigs.some((s) => s === null)
            ) {
                sig = null;
                sigModified = false;
                referenceSig = null;
            }
            // If we reached here, then that means that all of the values were
            // changed to something else.
            else {
                // If they were all changed to the same thing, display that value.
                if (allSigs.every((s) => s === allSigs[0])) {
                    sig = allSigs[0];
                    sigModified = true;
                }
                // Otherwise, they were all changed to different things. Just
                // default to an unchecked box
                else {
                    sig = null;
                    sigModified = false;
                }
            }
            const allJobs: Array<number | null> = oas.map((oa) =>
                getSingleOAChanges(oa.name).get("job_types")
            );
            if (allJobs.every((j) => j === allJobs[0] && j !== null)) {
                job = allJobs[0];
                jobModified = true;
            } else {
                job = null;
                jobModified = false;
            }
            const allUses: Array<number | null> = oas.map((oa) =>
                getSingleOAChanges(oa.name).get("use")
            );
            if (allUses.every((u) => u === allUses[0] && u !== null)) {
                use = allUses[0];
                useModified = true;
            } else {
                use = null;
                useModified = false;
            }
            const allGreens: Array<number | null> = oas.map((oa) =>
                getSingleOAChanges(oa.name).get("greenspace")
            );
            if (allGreens.every((g) => g === allGreens[0] && g !== null)) {
                green = allGreens[0];
                greenModified = true;
            } else {
                green = null;
                greenModified = false;
            }
        }
    }

    // Variables for OA modifiers
    let sig: number | null = null;
    let sigModified: boolean;
    let referenceSig: null | number;
    let job: number | null = null;
    let jobModified: boolean;
    let use: number | null = null;
    let useModified: boolean;
    let green: number | null = null;
    let greenModified: boolean;

    let jobMin: number;
    let jobMax: number;
    let useMin: number;
    let useMax: number;
    $: {
        // Update values in dropdowns whenever clickedOAs is changed
        if (mounted) loadOAChangesToUI($clickedOAs);
    }
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

{#if $clickedOAs.length === 0}
    <p>
        Click on the map to select an output area to modify. You can select
        multiple output areas by holding down the Shift key.
    </p>
{:else}
    <p>
        Currently selected {$clickedOAs.length} OA{$clickedOAs.length > 1
            ? "s"
            : ""}: {$clickedOAs.map((oa) => oa.name).join(", ")}
    </p>
    <p>
        (Shift-click to select more output areas, or click anywhere outside the
        map to deselect all output areas.)
    </p>

    <div id="changes-grid">
        <label for="sig-modified">Signature</label>
        <input
            type="checkbox"
            id="sig-modified"
            bind:checked={sigModified}
            on:change={() => {
                if (sigModified) {
                    sig = referenceSig;
                }
                if ($clickedOAs.length > 1 && !sigModified) {
                    sig = null;
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
                {#each [...config.signatures.entries()] as [signatureId, signature]}
                    <option value={signatureId}
                        >{signatureId}: {signature.name}</option
                    >
                {/each}
            </select>
        {:else}
            <select id="sig-dropdown" value={referenceSig} disabled>
                {#each [...config.signatures.entries()] as [signatureId, signature]}
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
            leftEdge={0}
            rightEdge={1}
            min={jobMin}
            max={jobMax}
            defaultVal={jobMin}
            step={0.01}
        />

        <Slider
            title="Building use"
            bind:modified={useModified}
            bind:value={use}
            on:modified={updateOAChanges}
            leftEdge={0}
            rightEdge={1}
            min={useMin}
            max={useMax}
            defaultVal={useMin}
            step={0.01}
        />

        <Slider
            title="Greenspace"
            bind:modified={greenModified}
            bind:value={green}
            on:modified={updateOAChanges}
            leftEdge={0}
            rightEdge={1}
            min={0}
            max={1}
            defaultVal={0}
            step={0.01}
        />
    </div>
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
