<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import {
        BackForwardButtons,
        HoverableLabel,
        InputFieldsContainer,
        HorizontalRule,
        Slider,
    } from "src/lib/leftSidebar/create/ui";
    const dispatch = createEventDispatcher();

    import { onMount, onDestroy } from "svelte";
    import {
        allScenarios,
        scenarioName,
        customScenarioInProgress,
        clickedOAs,
        oaSelectionMethod,
    } from "src/stores";
    import {
        type MacroVar,
        type ScenarioChanges,
        config,
    } from "src/data/config";

    // The actual changes
    export let changes: ScenarioChanges =
        $allScenarios.get($scenarioName).changes;
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

    // UI variables
    let sig: number | null = null; // Active value of the signature
    let sigModified: boolean; // Signature checkbox
    let referenceSig: null | number; // Underlying signature type (if no changes)
    let job: number | null = null; // Job types slider value
    let jobModified: boolean; // Job types checkbox
    let jobMin: number; // Minimum value of job types slider
    let jobMax: number; // Maximum value of job types slider
    let use: number | null = null; // Building use slider value
    let useModified: boolean; // Building use checkbox
    let useMin: number; // Minimum value of building use slider
    let useMax: number; // Maximum value of building use slider
    let green: number | null = null; // Greenspace slider value
    let greenModified: boolean; // Greenspace checkbox
    let showMacroVariables: boolean = false; // Whether to show the macrovariable sliders

    // Much of the logic in custom scenario creation has to do with determining
    // the signature types of the OAs being selected. This, in turn, determines
    // what is shown in the UI. There are several possible states for OA
    // selection, enumerated in the following discriminated union.
    interface None {
        // When the user has not selected any OAs
        kind: "None";
    }
    interface SingleActive {
        // When the user has selected one OA and has modified the signature type
        kind: "SingleActive";
        oaName: string;
        sigId: number;
    }
    interface SinglePassive {
        // When the user has selected one OA and has not modified the signature
        // type, i.e. we are fetching the baseline signature
        kind: "SinglePassive";
        oaName: string;
        sigId: number;
    }
    interface MultipleDifferent {
        // When the user has selected multiple OAs and they are not all the same
        kind: "MultipleDifferent";
        oaNames: string[];
        sigIds: number[]; // Baseline signatures
    }
    interface MultipleSameActive {
        // When the user has selected multiple OAs and has changed all of them
        // to the same signature type
        kind: "MultipleSameActive";
        oaNames: string[];
        sigId: number;
    }
    interface MultipleSamePassive {
        // When the user has selected multiple OAs and has changed none or some
        // of them, and all now have the same signature type
        kind: "MultipleSamePassive";
        oaNames: string[];
        sigId: number;
    }
    type SignatureState =
        | None
        | SingleActive
        | SinglePassive
        | MultipleDifferent
        | MultipleSameActive
        | MultipleSamePassive;
    function determineSignatureState(
        oas: Array<{ name: string }>
    ): SignatureState {
        if (oas.length === 0) {
            return { kind: "None" };
        } else if (oas.length === 1) {
            const oaName = oas[0].name;
            const sig = getSingleOAChanges(oaName).get("signature_type");
            if (sig === null) {
                return {
                    kind: "SinglePassive",
                    oaName,
                    sigId: getReferenceSigSingleOA(oaName),
                };
            } else {
                return { kind: "SingleActive", oaName, sigId: sig };
            }
        } else {
            const oaNames = oas.map((oa) => oa.name);
            const oaChanges = oas.map((oa) => getSingleOAChanges(oa.name));
            const allSigs = oaChanges.map((oa) => oa.get("signature_type"));
            const allReferenceSigs = oaNames.map((oa) =>
                getReferenceSigSingleOA(oa)
            );
            if (allSigs.every((s) => s === null)) {
                // None of the OAs have been modified ...
                if (allReferenceSigs.every((s) => s === allReferenceSigs[0])) {
                    // ... and all the reference signatures are the same
                    return {
                        kind: "MultipleSamePassive",
                        oaNames,
                        sigId: allReferenceSigs[0],
                    };
                } else {
                    // ... and the reference signatures are different
                    return {
                        kind: "MultipleDifferent",
                        oaNames,
                        sigIds: allReferenceSigs,
                    };
                }
            } else if (
                allSigs.some((s) => s !== null) &&
                allSigs.some((s) => s === null)
            ) {
                // Some of the OAs have been modified, but not all ...
                const allUnderlyingSigs = allSigs.map(
                    (sig, i) => sig || allReferenceSigs[i]
                );
                if (
                    allUnderlyingSigs.every((s) => s === allUnderlyingSigs[0])
                ) {
                    // ... and all the underlying signatures are the same
                    return {
                        kind: "MultipleSamePassive",
                        oaNames,
                        sigId: allUnderlyingSigs[0],
                    };
                } else {
                    // ... and the underlying signatures are different
                    return {
                        kind: "MultipleDifferent",
                        oaNames,
                        sigIds: allUnderlyingSigs,
                    };
                }
            } else {
                // All of the OAs have been modified ...
                if (allSigs.every((s) => s === allSigs[0])) {
                    // ... to the same thing
                    return {
                        kind: "MultipleSameActive",
                        oaNames,
                        sigId: allSigs[0],
                    };
                } else {
                    // ... to different things
                    return {
                        kind: "MultipleDifferent",
                        oaNames,
                        sigIds: allSigs,
                    };
                }
            }
        }
    }
    let sigState = determineSignatureState($clickedOAs);

    // Extract the signature type from the reference scenario (i.e. baseline)
    function getReferenceSigSingleOA(oaName: string): number {
        return $allScenarios
            .get(config.referenceScenarioObject.metadata.name)
            .values.get(oaName)
            .get("signature_type");
    }

    // Get changes belonging to a single OA. If none, return null for all
    // editable layers
    function getSingleOAChanges(oaName: string): Map<MacroVar, number | null> {
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
        ]);
    }

    // Log changes to the console
    function logChanges(changes: ScenarioChanges) {
        const changesAsText =
            changes.size === 0
                ? "No changes"
                : [...changes.entries()]
                      .map(([oaName, thisOAChanges]) => {
                          return (
                              "  [" +
                              oaName +
                              "] " +
                              [...thisOAChanges.entries()]
                                  .map(([macroVar, value]) => {
                                      return (
                                          macroVar +
                                          ": " +
                                          String(value).padEnd(
                                              macroVar === "signature_type"
                                                  ? 2
                                                  : 4,
                                              " "
                                          )
                                      );
                                  })
                                  .join(" | ")
                          );
                      })
                      .join("\n");
        console.log("Updated 'changes' to:\n" + changesAsText);
    }

    // Update changes for all selected OAs from the slider
    function setOAChanges() {
        console.log("setOAChanges()", sig);
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
            $clickedOAs.forEach((oa) => {
                changes.set(oa.name, userSetChanges);
            });
        }
        dispatch("changesUpdated");
        userChangesPresent = true;
    }

    function roundToTwoDecimals(num: number): number {
        return Math.round(num * 100) / 100;
    }

    function setMacroVariablesSingleOA(oaName: string, sigId: number) {
        job = getSingleOAChanges(oaName).get("job_types");
        use = getSingleOAChanges(oaName).get("use");
        green = getSingleOAChanges(oaName).get("greenspace");
        jobModified = job !== null;
        useModified = use !== null;
        greenModified = green !== null;
        jobMin = roundToTwoDecimals(config.signatures[sigId].job_d1);
        jobMax = roundToTwoDecimals(config.signatures[sigId].job_d9);
        useMin = roundToTwoDecimals(config.signatures[sigId].use_d1);
        useMax = roundToTwoDecimals(config.signatures[sigId].use_d9);
    }

    function setMacroVariablesMultipleSame(oaNames: string[], sigId: number) {
        const oaChanges = oaNames.map((oaName) => getSingleOAChanges(oaName));
        function setMacroVariable(
            macroVarName: "job_types" | "use" | "greenspace"
        ) {
            const allValues = oaChanges.map((oa) => oa.get(macroVarName));
            if (allValues.every((v) => v === allValues[0] && v !== null)) {
                return allValues[0];
            } else {
                return null;
            }
        }
        job = setMacroVariable("job_types");
        jobModified = job !== null;
        use = setMacroVariable("use");
        useModified = use !== null;
        green = setMacroVariable("greenspace");
        greenModified = green !== null;
        jobMin = config.signatures[sigId].job_d1;
        jobMax = config.signatures[sigId].job_d9;
        useMin = config.signatures[sigId].use_d1;
        useMax = config.signatures[sigId].use_d9;
    }

    // Determine what should be shown in the UI based on the current changes of
    // all the clicked OAs.
    function loadOAChangesToUI() {
        switch (sigState.kind) {
            case "None":
                return;
            case "SingleActive":
                sig = sigState.sigId;
                sigModified = true;
                referenceSig = sigState.sigId;
                break;
            case "SinglePassive":
                sig = null;
                sigModified = false;
                referenceSig = sigState.sigId;
                break;
            case "MultipleDifferent":
                sig = null;
                sigModified = false;
                referenceSig = null;
                break;
            case "MultipleSameActive":
                sig = sigState.sigId;
                sigModified = true;
                referenceSig = null;
                break;
            case "MultipleSamePassive":
                sig = null;
                sigModified = false;
                referenceSig = sigState.sigId;
                break;
        }
        updateSliderUI();
    }

    function updateSliderUI() {
        function setJobUseMinMax(lsig: number) {
            jobMin = roundToTwoDecimals(config.signatures[lsig].job_d1);
            jobMax = roundToTwoDecimals(config.signatures[lsig].job_d9);
            useMin = roundToTwoDecimals(config.signatures[lsig].use_d1);
            useMax = roundToTwoDecimals(config.signatures[lsig].use_d9);
        }

        console.log(sigState);
        switch (sigState.kind) {
            case "None":
                showMacroVariables = false;
                break;
            case "SingleActive":
                showMacroVariables = true;
                setMacroVariablesSingleOA(sigState.oaName, sigState.sigId);
                setJobUseMinMax(sigState.sigId);
                break;
            case "SinglePassive":
                showMacroVariables = true;
                setMacroVariablesSingleOA(sigState.oaName, sigState.sigId);
                setJobUseMinMax(sigState.sigId);
                break;
            case "MultipleSameActive":
                showMacroVariables = true;
                setMacroVariablesMultipleSame(sigState.oaNames, sigState.sigId);
                setJobUseMinMax(sigState.sigId);
                break;
            case "MultipleSamePassive":
                showMacroVariables = true;
                setMacroVariablesMultipleSame(sigState.oaNames, sigState.sigId);
                setJobUseMinMax(sigState.sigId);
                break;
            case "MultipleDifferent":
                showMacroVariables = false;
                job = null;
                use = null;
                green = null;
                jobModified = false;
                useModified = false;
                greenModified = false;
                setOAChanges();
                break;
        }
    }

    // Update entire UI whenever clicked OAs are changed
    $: {
        $clickedOAs;
        sigState = determineSignatureState($clickedOAs);
        if (mounted) loadOAChangesToUI();
    }
</script>

<InputFieldsContainer title={"Step 2: Modify output areas"}>
    <BackForwardButtons
        backText="Back to scenario selection"
        forwardText="Continue to add metadata"
        on:backClick={() => dispatch("returnToSelection", {})}
        on:forwardClick={() => dispatch("proceedToMetadata", {})}
    />

    <HorizontalRule />

    <div id="selection-method-choice">
        <i>Selection method</i>
        <select id="oa-selection-method" bind:value={$oaSelectionMethod}>
            <option value="click">Click on map</option>
            <option value="draw">Freehand draw</option>
        </select>
    </div>
    {#if $oaSelectionMethod === "click"}
        <div class="smaller">
            Click on the map to select an output area. You can shift-click to
            select multiple, or click anywhere outside the map to deselect all.
        </div>
    {:else if $oaSelectionMethod === "draw"}
        <div class="smaller">
            Click and move your mouse on the map to draw a region of interest.
            When you are done drawing, click again on the starting point to
            select all OAs within the region.
        </div>
    {/if}

    <HorizontalRule />
    {#if $clickedOAs.length === 0}
        <span>No output areas selected.</span>
    {:else}
        <span
            >{$clickedOAs.length} output area{$clickedOAs.length === 1
                ? ""
                : "s"} selected.</span
        >
        <div id="changes-grid">
            <HoverableLabel
                forInputName="sig-modified"
                labelText="Signature"
                hoverText="Signature types are used to describe different levels of urbanity, and also control the valid range of values for the other variables."
            />
            <input
                type="checkbox"
                id="sig-modified"
                bind:checked={sigModified}
                on:change={() => {
                    if (sigModified && sigState.kind !== "MultipleDifferent") {
                        // Box was ticked, there is a single underlying signature -- set it
                        sig = referenceSig;
                    } else if (
                        sigModified &&
                        sigState.kind === "MultipleDifferent"
                    ) {
                        // Box was ticked, but there are multiple underlying signatures
                        sig = null;
                    } else {
                        // Box was unticked
                        sig = null;
                    }
                    setOAChanges();
                    sigState = determineSignatureState($clickedOAs);
                    updateSliderUI();
                }}
            />
            {#if sigModified}
                <select
                    id="sig-dropdown"
                    bind:value={sig}
                    on:change={() => {
                        setOAChanges();
                        sigState = determineSignatureState($clickedOAs);
                        updateSliderUI();
                    }}
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

            {#if showMacroVariables}
                <Slider
                    title="Job types"
                    description="The balance between blue- and white-collar jobs in the area. A value of 0 indicates fully blue-collar, 1 fully white-collar."
                    bind:modified={jobModified}
                    bind:value={job}
                    leftEdge={0}
                    rightEdge={1}
                    min={jobMin}
                    max={jobMax}
                    defaultVal={jobMin}
                    step={0.01}
                    on:change={setOAChanges}
                />

                <Slider
                    title="Building use"
                    description="The ratio of residential to commercial buildings in the area. A value of -1 indicates fully residential, and 1 fully commercial. The default value of 0 uses a standard value derived from the underlying signature type."
                    bind:modified={useModified}
                    bind:value={use}
                    leftEdge={-1}
                    rightEdge={1}
                    min={useMin}
                    max={useMax}
                    defaultVal={useMin}
                    step={0.01}
                    on:change={setOAChanges}
                />

                <Slider
                    title="Greenspace"
                    description="The proportion of the area that is formally classified as greenspace."
                    bind:modified={greenModified}
                    bind:value={green}
                    leftEdge={0}
                    rightEdge={1}
                    min={0}
                    max={1}
                    defaultVal={0}
                    step={0.01}
                    on:change={setOAChanges}
                />
            {/if}
        </div>
    {/if}
</InputFieldsContainer>

<style>
    div#changes-grid {
        width: 100%;
        display: grid;
        grid-template-columns: max-content min-content 1fr 1fr;
        grid-auto-rows: 25px;
        grid-column-gap: 2px;
        grid-row-gap: 5px;
        align-items: center;
    }

    select#sig-dropdown {
        grid-column: 3 / span 2;
    }

    div#selection-method-choice {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: baseline;
    }
    div.smaller {
        font-size: 85%;
    }
</style>
