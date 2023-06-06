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

    function swapScenarios() {
        if (compareScenarioName !== null) {
            const tmp = scenarioName;
            scenarioName = compareScenarioName;
            compareScenarioName = tmp;
            dispatch("changeScenario", {});
        }
    }

    let scenario: Scenario;
    $: {
        scenario = allScenarios.find((s) => s.name === scenarioName);
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
        <button id="dropdowns-swap" on:click={swapScenarios} disabled={compareScenarioName === null}>⇅</button>
        <span>Compare against:</span>
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
            <span id="view-choices">
                <label
                    ><input
                        bind:group={compareView}
                        type="radio"
                        value="original"
                        on:change={changeCompareView}
                    />{scenario.short} only</label
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
    </div>
    <h2>{scenario.long}</h2>
    <p>
        <!-- eslint-disable-next-line -->
        {@html scenario.description[0]}
    </p>
    {#each scenario.description.slice(1) as para}
        <!-- eslint-disable-next-line -->
        <p>{@html para}</p>
    {/each}
</div>

<style>
    div#sidebar {
        border-radius: 10px;
        opacity: 90%;
        box-sizing: border-box;
        width: 320px;
        min-width: 320px;
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
        grid-template-columns: max-content 1fr max-content;
        column-gap: 10px;
        row-gap: 5px;
        align-items: baseline;
    }
    span#view-choices {
        grid-column: 2/4;
    }

    button#dropdowns-swap {
        grid-column: 3;
        grid-row: 1/3;
        align-self: center;
        padding: 1px;
        background-color: #ffffff;
        border: 1px solid #e6e6e6;
        padding: 1px 3px;
        border-radius: 4px;
        color: #303030;
        cursor: pointer;
    }
    button#dropdowns-swap:disabled {
        color: #c7c7c7;
        cursor: not-allowed;
    }
    button#dropdowns-swap:hover:enabled {
        color: #202124;
        background-color: #f5f5f5;
        box-shadow: rgba(0, 0, 0, .1) 0 2px 2px;
    }
    button#dropdowns-swap:hover:active {
        background-color: #d0d0d0;
    }
    select {
        font-family: inherit;
    }
</style>
