<script lang="ts">
    import {
        type ScenarioName,
        type Scenario,
        allScenarios,
        type CompareView,
        type FactorName,
    } from "../constants";
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();

    export let activeFactor: FactorName;
    export let scenarioName: ScenarioName;
    export let compareScenarioName: ScenarioName | null;
    export let compareView: CompareView;

    // TODO Can we not do this?
    function changeScenario() {
        dispatch("changeScenario", {});
    }
    function changeCompareScenario() {
        dispatch("changeCompareScenario", {});
    }
    function changeCompareView() {
        dispatch("changeCompareView", {});
    }

    let scenario: Scenario;
    let compareScenario: Scenario | null;
    $: {
        scenario = allScenarios.find((s) => s.name === scenarioName);
        compareScenario =
            compareScenarioName === null
                ? null
                : allScenarios.find((s) => s.name === compareScenarioName);
    }
</script>

<div id="sidebar">
    <h1>Tyne and Wear development scenario modelling</h1>

    <p>
        Explore a modelled impact of various development scenarios in Tyne and
        Wear on four indicators of quality of life.
    </p>

    <div id="dropdowns">
        <span>Choose scenario:</span>
        <select
            id="scenario"
            bind:value={scenarioName}
            on:change={changeScenario}
        >
            {#each allScenarios as scenario}
                <option value={scenario.name}>{scenario.short}</option>
            {/each}
        </select>
        {#if scenarioName !== "baseline"}
            <span>Compare with:</span>
            <select
                id="compare"
                bind:value={compareScenarioName}
                on:change={changeCompareScenario}
            >
                <option value={null}>None</option>
                {#each allScenarios as compareScenario}
                    {#if compareScenario.name !== scenarioName}
                        <option value={compareScenario.name}
                            >{compareScenario.short}</option
                        >
                    {/if}
                {/each}
            </select>
            {#if compareScenarioName !== null}
                <span>View:</span>
                <span>
                    <label
                        ><input
                            bind:group={compareView}
                            type="radio"
                            value="original"
                            on:change={changeCompareView}
                        />{scenario.short}</label
                    ><br />
                    <label
                        ><input
                            bind:group={compareView}
                            type="radio"
                            value="other"
                            on:change={changeCompareView}
                        />{compareScenario.short}</label
                    ><br />
                    {#if activeFactor !== "sig"}
                    <label
                        ><input
                            bind:group={compareView}
                            type="radio"
                            value="difference"
                            on:change={changeCompareView}
                        />Difference</label
                    >
                    {/if}
                </span>
            {/if}
        {/if}
    </div>
    <h2>{scenario.long}</h2>
    <p>
        {@html scenario.description[0]}
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
