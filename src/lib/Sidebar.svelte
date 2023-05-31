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
        Intro text here.
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
        <b>{scenario.long}.</b> {@html scenario.description[0]}
    </p>
    {#each scenario.description.slice(1) as para}
        <p>{@html para}</p>
    {/each}
</div>

<style>
    div#sidebar {
        border-radius: 10px;
        opacity: 90%;
        box-sizing: border-box;
        width: 300px;
        min-width: 300px;
        padding: 20px;
        background-color: #ffffff;
        box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
        max-height: calc(100vh - 40px);
        overflow-y: auto;

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
    
    select {
        font-family: inherit;
    }
</style>
