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
    import leftIcon from "../assets/left.svg";
    import leftIconDisabled from "../assets/left-disabled.svg";
    import rightIcon from "../assets/right.svg";
    import rightIconDisabled from "../assets/right-disabled.svg";
    import showWelcomeIcon from "../assets/show-welcome.svg";
    import { createEventDispatcher } from "svelte";
    import { fly } from "svelte/transition";
    const dispatch = createEventDispatcher();

    export let scenarioName: ScenarioName;
    export let compareScenarioName: ScenarioName | null;
    export let compareView: CompareView;

    // Keeps track of the previous scenario name to determine the direction of the transition.
    // This variable is updated when the transition occurs.
    let previousScenarioName: ScenarioName = scenarioName;

    function changeScenario() {
        if (compareScenarioName === scenarioName) {
            // To deal with a slightly annoying bug, see #38
            compareScenarioName = null;
        }
        dispatch("changeScenario", {});
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
            changeScenario();
        }
    }
    function setMaxHeightToZeroAndDisableOverflow(event: CustomEvent) {
        const div = event.target as HTMLDivElement;
        div.style.maxHeight = "0px";
        const sidebar = document.getElementById("sidebar") as HTMLDivElement;
        // Stop scrollbars from showing up until transition finishes
        sidebar.style.overflowX = "hidden";
        sidebar.style.overflowY = "hidden";
    }
    function resetOverflow() {
        // Reset overflow so that scrollbars show up again (if needed)
        const sidebar = document.getElementById("sidebar") as HTMLDivElement;
        sidebar.style.overflowX = "clip";
        sidebar.style.overflowY = "auto";
    }

    // Custom transition
    function customFlyIn(node: HTMLElement) {
        const increased =
            allScenarios.map((s) => s.name).indexOf(previousScenarioName) <
            allScenarios.map((s) => s.name).indexOf(scenarioName);
        previousScenarioName = scenarioName;
        return fly(node, { x: increased ? 500 : -500 });
    }
    function customFlyOut(node: HTMLElement) {
        const increased =
            allScenarios.map((s) => s.name).indexOf(previousScenarioName) <
            allScenarios.map((s) => s.name).indexOf(scenarioName);
        return fly(node, { x: increased ? -500 : 500 });
    }

    // Logic for the left/right buttons to control dropdowns. The variables are
    // updated in the reactive block
    let allScenariosExceptCompare: ScenarioName[];
    let decreaseScenarioOk: boolean;
    let increaseScenarioOk: boolean;
    let allCompareScenariosExceptMain: Array<ScenarioName | null>;
    let decreaseCompareScenarioOk: boolean;
    let increaseCompareScenarioOk: boolean;

    function decreaseScenario() {
        const index = allScenariosExceptCompare.indexOf(scenarioName);
        if (index > 0) {
            scenarioName = allScenariosExceptCompare[index - 1];
        }
        changeScenario();
    }
    function increaseScenario() {
        const index = allScenariosExceptCompare.indexOf(scenarioName);
        if (index < allScenariosExceptCompare.length - 1) {
            scenarioName = allScenariosExceptCompare[index + 1];
        }
        changeScenario();
    }
    function decreaseCompareScenario() {
        const index =
            allCompareScenariosExceptMain.indexOf(compareScenarioName);
        if (index > 0) {
            compareScenarioName = allCompareScenariosExceptMain[index - 1];
        }
        changeScenario();
    }
    function increaseCompareScenario() {
        const index =
            allCompareScenariosExceptMain.indexOf(compareScenarioName);
        if (index < allCompareScenariosExceptMain.length - 1) {
            compareScenarioName = allCompareScenariosExceptMain[index + 1];
        }
        changeScenario();
    }

    let scenario: Scenario;
    $: {
        scenario = allScenarios.find((s) => s.name === scenarioName);

        allScenariosExceptCompare = allScenarios
            .map((s) => s.name)
            .filter((s) => s !== compareScenarioName);
        decreaseScenarioOk = scenarioName !== allScenariosExceptCompare[0];
        increaseScenarioOk =
            scenarioName !==
            allScenariosExceptCompare[allScenariosExceptCompare.length - 1];

        allCompareScenariosExceptMain = [
            null,
            ...allScenarios
                .map((s) => s.name)
                .filter((s) => s !== scenarioName),
        ];
        decreaseCompareScenarioOk =
            compareScenarioName !== allCompareScenariosExceptMain[0];
        increaseCompareScenarioOk =
            compareScenarioName !==
            allCompareScenariosExceptMain[
                allCompareScenariosExceptMain.length - 1
            ];
    }
</script>

<div id="sidebar">
    <h1>Tyne and Wear development scenario modelling</h1>

    <p>
        Explore a modelled impact of various development scenarios in Tyne and
        Wear on four indicators of quality of life.
        <Tooltip --width="max-content" --transformy="35px">
            <button slot="content" id="show-welcome" on:click={showWelcome}
                ><img
                    src={showWelcomeIcon}
                    alt="Show welcome screen again"
                /></button
            >
            <span slot="description">Show welcome screen</span>
        </Tooltip>
    </p>

    <h2>Scenario selection</h2>

    <div id="dropdowns">
        <span>Main scenario:</span>
        <button
            class="controls"
            on:click={decreaseScenario}
            disabled={!decreaseScenarioOk}
        >
            <img
                class="control-arrows"
                src={decreaseScenarioOk ? leftIcon : leftIconDisabled}
                alt="Decrease scenario"
            />
        </button>
        <select
            id="scenario"
            bind:value={scenarioName}
            on:change={changeScenario}
        >
            {#each allScenarios as scenario}
                <option value={scenario.name}>{scenario.short}</option>
            {/each}
        </select>
        <button
            class="controls"
            on:click={increaseScenario}
            disabled={!increaseScenarioOk}
        >
            <img
                class="control-arrows"
                src={increaseScenarioOk ? rightIcon : rightIconDisabled}
                alt="Increase scenario"
            />
        </button>

        <span id="swap-button-container">
            <Tooltip --width="max-content" --transformy="-7px">
                <button
                    slot="content"
                    class="controls"
                    on:click={swapScenarios}
                    disabled={compareScenarioName === null}
                >
                    <img
                        id="swap-icon"
                        src={compareScenarioName === null
                            ? swapIconDisabled
                            : swapIcon}
                        alt="Swap scenarios"
                        height="15px"
                    />
                </button>
                <span slot="description">Swap</span>
            </Tooltip>
        </span>

        <span>Compare against:</span>
        <button
            class="controls"
            on:click={decreaseCompareScenario}
            disabled={!decreaseCompareScenarioOk}
        >
            <img
                class="control-arrows"
                src={decreaseCompareScenarioOk ? leftIcon : leftIconDisabled}
                alt="Decrease compare scenario"
            />
        </button>
        <select
            id="compare"
            bind:value={compareScenarioName}
            on:change={changeScenario}
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
        <button
            class="controls"
            on:click={increaseCompareScenario}
            disabled={!increaseCompareScenarioOk}
        >
            <img
                class="control-arrows"
                src={increaseCompareScenarioOk ? rightIcon : rightIconDisabled}
                alt="Increase compare scenario"
            />
        </button>
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

    <!-- This wrapper container is used to make the fly transition work without a 'jumping' effect'. See https://stackoverflow.com/questions/59882179 -->
    <div id="scenario-description-container">
        {#key scenarioName}
            <div
                id="scenario-description"
                in:customFlyIn
                out:customFlyOut
                on:outrostart={setMaxHeightToZeroAndDisableOverflow}
                on:outroend={() => resetOverflow()}
            >
                <h3 id="scenario-title">{scenario.long}</h3>
                <p>
                    <!-- eslint-disable-next-line -->
                    {@html scenario.description[0]}
                </p>
                {#each scenario.description.slice(1) as para}
                    <!-- eslint-disable-next-line -->
                    <p>{@html para}</p>
                {/each}
            </div>
        {/key}
    </div>
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
        overflow-x: clip;
        overflow-y: auto;

        margin-left: 0px;
        margin-right: auto;
        pointer-events: auto;
    }
    div#sidebar > :first-child {
        margin-top: 0 !important;
    }

    div#dropdowns {
        display: grid;
        grid-template-columns: max-content min-content 1fr min-content max-content;
        column-gap: 4px;
        row-gap: 5px;
        align-items: center;
    }
    span#view-choices {
        grid-column: 2/6;
    }

    h2 {
        margin-top: 15px;
    }

    button#show-welcome {
        background-color: transparent;
        border: none;
        cursor: pointer;
        padding: 0;
        height: 15px;
        width: 15px;
        transform: translateY(2px);
    }
    button#show-welcome:hover {
        background-color: #dddddd;
    }
    button#show-welcome > img {
        height: 100%;
        width: 100%;
    }

    span#swap-button-container {
        grid-column: 5;
        grid-row: 1/3;
        align-self: center;
    }

    img#swap-icon {
        padding: 1px;
        height: 12px;
    }

    button.controls {
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
    button.controls:disabled {
        cursor: not-allowed;
    }
    button.controls:hover:enabled {
        background-color: #f0f0f0;
        box-shadow: rgba(0, 0, 0, 0.1) 0 2px 2px;
    }
    button.controls:hover:active {
        background-color: #d0d0d0;
    }

    img.control-arrows {
        width: 8px;
        padding-bottom: 1px;
    }

    select {
        font-family: inherit;
    }

    div#scenario-description-container {
        display: grid;
    }
    h3#scenario-title {
        font-size: 110%;
    }
    div#scenario-description {
        grid-column: 1;
        grid-row: 1;
    }
    div#scenario-description > :last-child {
        margin-bottom: 0 !important;
    }
</style>
