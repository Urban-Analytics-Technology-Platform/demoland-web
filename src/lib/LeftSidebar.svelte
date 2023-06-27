<script lang="ts">
    import {
        type ScenarioName,
        type Scenario,
        allScenarios,
        type CompareView,
    } from "../constants";
    import Tooltip from "./Tooltip.svelte";
    import swapIcon from "../assets/swap.svg";
    import swapIconDisabled from "../assets/swap-disabled.svg";
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();

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
    function showWelcome() {
        dispatch("showWelcome", {});
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

    <p>
        <button id="show-welcome" on:click={showWelcome}>(show welcome screen again)</button>
    </p>

    <h2>Scenario selection</h2>

    <div id="dropdowns">
        <span>Main scenario:</span>
        <select
            id="scenario"
            bind:value={scenarioName}
            on:change={changeScenario}
        >
            {#each allScenarios as scenario}
                <option value={scenario.name}>{scenario.short}</option>
            {/each}
        </select>

        <span id="swap-button-container">
        <Tooltip --width="max-content" --transformy="-7px">
            <button
                slot="content"
                id="dropdowns-swap"
                on:click={swapScenarios}
                disabled={compareScenarioName === null}>
                <img id="swap-icon" src={compareScenarioName === null ? swapIconDisabled : swapIcon} alt="Swap scenarios" height="15px" />
            </button>
            <span slot="description"
                >Swap</span
            >
        </Tooltip>
        </span>

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
                        value="difference"
                        on:change={changeCompareView}
                    />Differences</label
                >
                <br />
                <label
                    ><input
                        bind:group={compareView}
                        type="radio"
                        value="original"
                        on:change={changeCompareView}
                    />{scenario.short} only</label
                >
            </span>
        {/if}
    </div>
    <h2 id="scenario-title">{scenario.long}</h2>
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

    h2 {
        margin-top: 15px;
    }

    button#show-welcome {
        font-size: 80%;
        cursor: pointer;
        font-family: inherit;
        font-style: italic;
    }

    span#swap-button-container {
        grid-column: 3;
        grid-row: 1/3;
        align-self: center;
    }

    img#swap-icon {
        padding: 1px;
        height: 12px;
    }

    button#dropdowns-swap {
        position: relative;
        padding: 2px 4px 0px 4px;
        background-color: #ffffff;
        border: 1px solid #e6e6e6;
        border-radius: 4px;
        color: #303030;
        cursor: pointer;
        font-family: inherit;
        font-size: 80%;
    }
    button#dropdowns-swap:disabled {
        cursor: not-allowed;
    }
    button#dropdowns-swap:hover:enabled {
        background-color: #f0f0f0;
        box-shadow: rgba(0, 0, 0, 0.1) 0 2px 2px;
    }
    button#dropdowns-swap:hover:active {
        background-color: #d0d0d0;
    }

    select {
        font-family: inherit;
    }
</style>
