<script lang="ts">
    import swapIcon from "../../assets/swap.svg";
    import swapIconDisabled from "../../assets/swap-disabled.svg";
    import leftIcon from "../../assets/left.svg";
    import leftIconDisabled from "../../assets/left-disabled.svg";
    import rightIcon from "../../assets/right.svg";
    import rightIconDisabled from "../../assets/right-disabled.svg";
    import Tooltip from "../reusable/Tooltip.svelte";
    import {
        type Scenario,
        allScenarios,
        type ScenarioName,
        type CompareView,
    } from "../../constants";
    import { createEventDispatcher } from "svelte";
    import { fly } from "svelte/transition";

    export let scenarioName: ScenarioName;
    export let compareScenarioName: ScenarioName | null = null;
    export let compareView: CompareView;

    const dispatch = createEventDispatcher();

    const allScenarioNames = [...allScenarios.keys()];

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

    function swapScenarios() {
        if (compareScenarioName !== null) {
            const tmp = scenarioName;
            scenarioName = compareScenarioName;
            compareScenarioName = tmp;
            changeScenario();
        }
    }
    function setMaxHeightToZero(event: CustomEvent) {
        const div = event.target as HTMLDivElement;
        div.style.maxHeight = "0px";
    }

    // Custom transition
    function customFlyIn(node: HTMLElement) {
        const increased =
            allScenarioNames.indexOf(previousScenarioName) <
            allScenarioNames.indexOf(scenarioName);
        previousScenarioName = scenarioName;
        return fly(node, { x: increased ? 500 : -500 });
    }
    function customFlyOut(node: HTMLElement) {
        const increased =
            allScenarioNames.indexOf(previousScenarioName) <
            allScenarioNames.indexOf(scenarioName);
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

    let selectedTab: "choose" | "compare" | "create" = "choose";

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
        scenario = allScenarios.get(scenarioName);

        allScenariosExceptCompare = allScenarioNames.filter(
            (s) => s !== compareScenarioName
        );
        decreaseScenarioOk = scenarioName !== allScenariosExceptCompare[0];
        increaseScenarioOk =
            scenarioName !==
            allScenariosExceptCompare[allScenariosExceptCompare.length - 1];

        allCompareScenariosExceptMain = [
            null,
            ...allScenarioNames.filter((s) => s !== scenarioName),
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

<div>
    <div class="tabs">
        <input
            type="radio"
            class="tab-input"
            id="choose"
            bind:group={selectedTab}
            value="choose"
            checked
        />
        <label for="choose" class="tab-label">Choose scenario</label>

        <input
            type="radio"
            class="tab-input"
            id="compare"
            bind:group={selectedTab}
            value="compare"
        />
        <label for="compare" class="tab-label">Compare against</label>

        <input
            type="radio"
            class="tab-input"
            id="create"
            bind:group={selectedTab}
            value="create"
        />
        <label for="create" class="tab-label">Create your own</label>
    </div>

    <div class="tab-content">
        {#if selectedTab === "choose"}
            <div class="controls-grid">
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
                    {#each [...allScenarios.entries()] as [name, scenario]}
                        <option value={name}>{scenario.long}</option>
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
            </div>

            <!-- This wrapper container is used to make the fly transition work without a 'jumping' effect'. See https://stackoverflow.com/questions/59882179 -->
            <div id="scenario-description-container">
                {#key scenarioName}
                    <div
                        id="scenario-description"
                        in:customFlyIn|local
                        out:customFlyOut|local
                        on:outrostart={setMaxHeightToZero}
                    >
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
        {:else if selectedTab === "compare"}
            <div class="controls-grid">
                <button
                    class="controls"
                    on:click={decreaseCompareScenario}
                    disabled={!decreaseCompareScenarioOk}
                >
                    <img
                        class="control-arrows"
                        src={decreaseCompareScenarioOk
                            ? leftIcon
                            : leftIconDisabled}
                        alt="Decrease compare scenario"
                    />
                </button>
                <select
                    id="compare"
                    bind:value={compareScenarioName}
                    on:change={changeScenario}
                >
                    <option value={null}>None</option>
                    {#each [...allScenarios.entries()] as [name, compareScenario]}
                        {#if name !== scenarioName}
                            <option value={name}>{compareScenario.long}</option>
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
                        src={increaseCompareScenarioOk
                            ? rightIcon
                            : rightIconDisabled}
                        alt="Increase compare scenario"
                    />
                </button>
                {#if compareScenarioName !== null}
                    <span id="view-choices">
                        <label
                            ><input
                                bind:group={compareView}
                                type="radio"
                                value="difference"
                                on:change={changeCompareView}
                            />View differences</label
                        >
                        <br />
                        <label
                            ><input
                                bind:group={compareView}
                                type="radio"
                                value="original"
                                on:change={changeCompareView}
                            />View only {scenario.short}</label
                        >
                    </span>
                {/if}
            </div>
        {:else if selectedTab === "create"}
            Create your own scenario by changing values on the map. Coming soon
            to a web app near you...
        {/if}
    </div>

    {#if false}
        <!-- re-enable if needed -->
        <div id="swap-button-container">
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
        </div>
    {/if}
</div>

<style>
    div.tabs {
        display: grid;
        gap: 10px;
        grid-template-columns: repeat(3, 1fr);
    }

    input.tab-input {
        display: none;
    }

    label.tab-label {
        display: block;
        padding: 5px 10px;
        border: 1px solid #e6e6e6;
        border-bottom: none;
        border-radius: 6px 6px 0px 0px;
        background-color: #f0f0f0;
        color: #333333;
        cursor: pointer;
        font-family: inherit;
        text-align: center;
        font-size: 90%;
    }

    input.tab-input:checked + label.tab-label {
        background-color: #ffffff;
        color: #000000;
        font-weight: bold;
    }

    div.tab-content {
        padding: 10px;
        border: 1px solid #e6e6e6;
        border-radius: 0px 0px 6px 6px;
        background-color: #ffffff;
    }

    span#view-choices {
        grid-column: 2 / 3;
    }

    img#swap-icon {
        padding: 1px;
        height: 12px;
    }

    div.controls-grid {
        width: 100%;
        display: grid;
        grid-template-columns: max-content 1fr max-content;
        align-items: center;
        gap: 10px;
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
