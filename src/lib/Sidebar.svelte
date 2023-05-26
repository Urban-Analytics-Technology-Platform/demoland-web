<script lang="ts">
    import { type ScenarioName, allScenarios, type CompareView, allCompareViews } from "../constants";
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();

    export let scenarioName: ScenarioName;
    export let compareScenarioName: ScenarioName | null;
    export let compareView: CompareView;

    // TODO Can we not do this?
    function changeScenario(_: Event) {
        dispatch("changeScenario", {});
    }
    function changeCompareScenario(_: Event) {
        dispatch("changeCompareScenario", {});
    }
    function changeCompareView(_: Event) {
        dispatch("changeCompareView", {});
    }

    $: scenario = allScenarios.find(s => s.name === scenarioName);
</script>

<div id="sidebar">
    <h1>Land Use Demonstrator</h1>

    <p>
        “In vain have I struggled. It will not do. My feelings will not be
        repressed. You must allow me to tell you how ardently I admire and love
        you.”
    </p>

    <div id="dropdowns">
        <span>Choose scenario:</span>
        <select id="scenario" bind:value={scenarioName} on:change={changeScenario}>
            {#each allScenarios as scenario}
                <option value={scenario.name}>{scenario.short}</option>
            {/each}
        </select>
        {#if scenarioName !== "baseline"}
            <span>Compare with:</span>
            <select id="compare" bind:value={compareScenarioName} on:change={changeCompareScenario}>
                <option value={null}>None</option>
                {#each allScenarios as compareScenario}
                    {#if compareScenario.name !== scenarioName}
                        <option value={compareScenario.name}>{compareScenario.short}</option>
                    {/if}
                {/each}
            </select>
            {#if compareScenarioName !== null}
                <span>View:</span>
                <select id="view" bind:value={compareView} on:change={changeCompareView}>
                    {#each allCompareViews as view}
                        <option value={view.value}>{view.description}</option>
                    {/each}
                </select>
            {/if}
        {/if}
    </div>
    <p>
        <b>{scenario.short}:</b> {scenario.description[0]}
    </p>
    {#each scenario.description.slice(1) as para}
        <p>{para}</p>
    {/each}
</div>

<style>
    div#sidebar {
        border-radius: 10px;
        opacity: 90%;
        box-sizing: border-box;
        width: 280px;
        min-width: 280px;
        padding: 20px;
        background-color: #deb4f0; /* purple */
        border: 1px solid black;

        margin-left: 0px;
        margin-right: auto;
        pointer-events: auto;
    }
    div#sidebar > :first-child {
        margin-top: 0 !important;
    }
    div#sidebar > :last-child {
        margin-bottom: 0 !important;
    }
    div#dropdowns {
        display: grid;
        grid-template-columns: max-content 1fr;
        column-gap: 10px;
        row-gap: 5px;
        align-items: baseline;
    }
</style>
