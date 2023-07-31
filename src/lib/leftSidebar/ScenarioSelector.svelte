<script lang="ts">
    import leftIcon from "../../assets/left.svg";
    import leftIconDisabled from "../../assets/left-disabled.svg";
    import rightIcon from "../../assets/right.svg";
    import rightIconDisabled from "../../assets/right-disabled.svg";
    import {
        type Scenario,
        allScenarios,
        type ScenarioName,
        type CompareView,
    } from "../../constants";
    import { createEventDispatcher } from "svelte";
    import { fly, slide } from "svelte/transition";

    export let scenarioName: ScenarioName;
    export let compareScenarioName: ScenarioName | null = null;
    export let compareView: CompareView = "original";

    const dispatch = createEventDispatcher();

    const allScenarioNames = [...allScenarios.keys()];
    const allCompareScenarioNames = [null, ...allScenarioNames];

    // Keeps track of the previous scenario name to determine the direction of the transition.
    // This variable is updated when the transition occurs.
    let previousScenarioName: ScenarioName = scenarioName;
    let previousCompareScenarioName: ScenarioName | null = compareScenarioName;

    function changeScenario() {
        if (compareScenarioName === scenarioName) {
            // To deal with a slightly annoying bug, see #38
            compareScenarioName = null;
        }
        dispatch("changeScenario", {});
    }

    function setMaxHeightToZero(event: CustomEvent) {
        const div = event.target as HTMLDivElement;
        div.style.maxHeight = "0px";
    }

    let descriptionVisible = false;
    function toggleDescriptionVisible() {
        descriptionVisible = !descriptionVisible;
    }
    let compareDescriptionVisible = false;
    function toggleCompareDescriptionVisible() {
        compareDescriptionVisible = !compareDescriptionVisible;
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
    function customFlyInCmp(node: HTMLElement) {
        const increased =
            allCompareScenarioNames.indexOf(previousCompareScenarioName) <
            allCompareScenarioNames.indexOf(compareScenarioName);
        previousCompareScenarioName = compareScenarioName;
        return fly(node, { x: increased ? 500 : -500 });
    }
    function customFlyOutCmp(node: HTMLElement) {
        const increased =
            allCompareScenarioNames.indexOf(previousCompareScenarioName) <
            allCompareScenarioNames.indexOf(compareScenarioName);
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

    let selectedTab: "choose" | "create" | "import" = "choose";

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
    let compareScenario: Scenario | null;
    $: {
        scenario = allScenarios.get(scenarioName);
        compareScenario =
            compareScenarioName === null
                ? null
                : allScenarios.get(compareScenarioName);

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

<div id="scenario-selector">
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
            id="create"
            bind:group={selectedTab}
            value="create"
        />
        <label for="create" class="tab-label">Create your own</label>

        <input
            type="radio"
            class="tab-input"
            id="import"
            bind:group={selectedTab}
            value="import"
        />
        <label for="import" class="tab-label">Import from file</label>
    </div>

    <div class="tab-content">
        {#if selectedTab === "choose"}
            Select a scenario and compare it against the baseline to see the
            impact of the modelled development strategies on any of the four
            indicators.

            <h3>Main scenario</h3>
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
                <button class="toggle-description" on:click={toggleDescriptionVisible}>
                    {descriptionVisible ? " hide description " : " show description "}
                    <span class="small-icon">{descriptionVisible ? "∧" : "∨"}</span>
                </button>
            </div>

            {#if descriptionVisible}
                <div id="scenario-description-container" transition:slide>
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
            {/if}

            <h3>Compare against</h3>
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
                    <button class="toggle-description" on:click={toggleCompareDescriptionVisible}>
                        {compareDescriptionVisible ? " hide description " : " show description "}
                        <span class="small-icon">{compareDescriptionVisible ? "∧" : "∨"}</span>
                    </button>
                {/if}
            </div>

            {#if compareDescriptionVisible && compareScenarioName !== null}
                <div id="compare-scenario-description-container" transition:slide>
                    {#key compareScenarioName}
                        <div
                            id="compare-scenario-description"
                            in:customFlyInCmp|local
                            out:customFlyOutCmp|local
                            on:outrostart={setMaxHeightToZero}
                        >
                            <p>
                                <!-- eslint-disable-next-line -->
                                {@html compareScenario.description[0]}
                            </p>
                            {#each compareScenario.description.slice(1) as para}
                                <!-- eslint-disable-next-line -->
                                <p>{@html para}</p>
                            {/each}
                        </div>
                    {/key}
                </div>
            {/if}
        {:else if selectedTab === "create"}
            Create your own scenario by changing values on the map. Coming soon
            to a web app near you...
        {:else if selectedTab === "import"}
            Import a scenario you have previously saved. Coming soon to a web
            app near you...
        {/if}
    </div>
</div>

<style>
    div#scenario-selector {
        margin-top: 15px;
    }
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
        padding: 10px 10px 12px 10px;
        border: 1px solid #e6e6e6;
        border-radius: 0px 0px 6px 6px;
        background-color: #ffffff;
    }

    div.controls-grid {
        width: 100%;
        display: grid;
        grid-template-columns: max-content 1fr max-content;
        align-items: center;
        gap: 10px;
        grid-row-gap: 5px;
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

    button.toggle-description {
        font-size: 80%;
        grid-column: 2 / 3;
        background-color: #ffffff;
        border: 0px;
        color: #565656;
    }
    span.small-icon {
        margin-left: 5px;
        font-size: 80%;
    }

    img.control-arrows {
        width: 8px;
        padding-bottom: 1px;
    }

    select {
        font-family: inherit;
    }
    h3 {
        font-size: 100%;
        font-weight: bold;
    }

    div#scenario-description-container, div#compare-scenario-description-container {
        padding-top: 5px;
        display: grid;
    }
    div#scenario-description, div#compare-scenario-description {
        grid-column: 1;
        grid-row: 1;
    }
    div#scenario-description > :first-child, div#compare-scenario-description > :first-child {
        margin-top: 0 !important;
    }
    div#scenario-description > :last-child, div#compare-scenario-description > :last-child {
        margin-bottom: 0 !important;
    }
</style>
