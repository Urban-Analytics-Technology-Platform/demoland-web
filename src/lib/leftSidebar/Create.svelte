<script lang="ts">
    export let clickedOAName: string | null;
    export let scenarioName: string | null;
    import ChooseStartingScenario from "./create/ChooseStartingScenario.svelte";
    import ModifyOutputAreas from "./create/ModifyOutputAreas.svelte";
    import { createEventDispatcher } from "svelte";
    import { getLocalChanges, changesToApiJson } from "./lsHelpers";
    import {
        type Scenario,
        type MacroVar,
        type LayerName,
    } from "../../constants";
    import { allScenarios, rescale } from "../../scenarios";
    const dispatch = createEventDispatcher();

    let step: number = 1;

    function changeScenarioAndProceed() {
        dispatch("changeScenario", {});
        step = 2;
    }

    function acceptChangesAndCalculate() {
        const changedJson = changesToApiJson(getLocalChanges());
        step = 3;

        // const url = window.location.href.includes("localhost")
        //     ? "http://localhost:5174"
        //     : "https://demoland-api.azurewebsites.net/";
        const url = "https://demoland-api.azurewebsites.net/";
        fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: changedJson,
        }).then((response) => {
            if (response.ok) {
                console.log(response);
                response.json().then((values) => {
                    console.log("Success!");

                    // TODO This code is copied from Import.svelte - we should refactor
                    const changed = JSON.parse(changedJson);
                    const newScenario: Scenario = {
                        name: "Custom",
                        short: "Custom scenario",
                        long: "Custom scenario",
                        description: ["Custom scenario"],
                        values: new Map(),
                        changed: new Map(),
                    };
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

                    // Check for name duplication
                    if ($allScenarios.has(newScenario.name)) {
                        let i = 1;
                        while ($allScenarios.has(`${newScenario.name}_${i})`)) {
                            i++;
                        }
                        newScenario.name = `${newScenario.name}_${i}`;
                    }
                    $allScenarios.set(newScenario.name, newScenario);
                    dispatch("import", { name: newScenario.name });
                });
            } else {
                throw new Error(
                    "Failed to calculate scenario values from server"
                );
            }
        });
        // TODO: parse values
        // TODO: create a new Scenario (use code from Import.svelte)
    }
</script>

Create your own scenario by modifying an existing one.

<p style="color: red">TODO: buttons to move between stages</p>

{#if step === 1}
    <ChooseStartingScenario
        bind:scenarioName
        on:changeScenario={changeScenarioAndProceed}
    />
{/if}

{#if step === 2}
    <input
        type="button"
        value="Accept changes and calculate"
        on:click={acceptChangesAndCalculate}
    />
    <ModifyOutputAreas bind:clickedOAName bind:scenarioName />
{/if}

{#if step === 3}
    CALCULATING!! WAOW IT'S HAPPENING!!
{/if}
