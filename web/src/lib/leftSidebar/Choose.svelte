<script lang="ts">
    import leftIcon from "src/assets/left.svg";
    import leftIconDisabled from "src/assets/left-disabled.svg";
    import rightIcon from "src/assets/right.svg";
    import rightIconDisabled from "src/assets/right-disabled.svg";

    import { createEventDispatcher } from "svelte";
    import { fly, slide } from "svelte/transition";

    import { type Scenario } from "src/types";
    import Export from "./Export.svelte";
    import {
        allScenarios,
        scenarioName,
        compareScenarioName,
    } from "src/stores";

    const dispatch = createEventDispatcher();

    const allScenarioNames = [...$allScenarios.keys()];
    const allCompareScenarioNames = [null, ...allScenarioNames];

    // Keeps track of the previous scenario name to determine the direction of the transition.
    // This variable is updated when the transition occurs.
    let previousScenarioName: string = $scenarioName;
    let previousCompareScenarioName: string | null = $compareScenarioName;

    function changeScenario() {
        if ($compareScenarioName === $scenarioName) {
            $compareScenarioName = null;
        }
        dispatch("changeScenario", {});
    }

    function setMaxHeightToZero(event: CustomEvent) {
        const div = event.target as HTMLDivElement;
        div.style.maxHeight = "0px";
    }

    let descriptionVisible = true;
    function toggleDescriptionVisible() {
        descriptionVisible = !descriptionVisible;
    }
    let compareDescriptionVisible = false;
    function toggleCompareDescriptionVisible() {
        if ($compareScenarioName !== null) {
            compareDescriptionVisible = !compareDescriptionVisible;
        }
    }

    // Custom transition
    function customFlyIn(node: HTMLElement) {
        const increased =
            allScenarioNames.indexOf(previousScenarioName) <
            allScenarioNames.indexOf($scenarioName);
        previousScenarioName = $scenarioName;
        return fly(node, { x: increased ? 500 : -500 });
    }
    function customFlyOut(node: HTMLElement) {
        const increased =
            allScenarioNames.indexOf(previousScenarioName) <
            allScenarioNames.indexOf($scenarioName);
        return fly(node, { x: increased ? -500 : 500 });
    }
    function customFlyInCmp(node: HTMLElement) {
        const increased =
            allCompareScenarioNames.indexOf(previousCompareScenarioName) <
            allCompareScenarioNames.indexOf($compareScenarioName);
        previousCompareScenarioName = $compareScenarioName;
        return fly(node, { x: increased ? 500 : -500 });
    }
    function customFlyOutCmp(node: HTMLElement) {
        const increased =
            allCompareScenarioNames.indexOf(previousCompareScenarioName) <
            allCompareScenarioNames.indexOf($compareScenarioName);
        return fly(node, { x: increased ? -500 : 500 });
    }

    // Logic for the left/right buttons to control dropdowns. The variables are
    // updated in the reactive block
    let allScenariosExceptCompare: string[];
    let decreaseScenarioOk: boolean;
    let increaseScenarioOk: boolean;
    let allCompareScenariosExceptMain: Array<string | null>;
    let decreaseCompareScenarioOk: boolean;
    let increaseCompareScenarioOk: boolean;

    function decreaseScenario() {
        const index = allScenariosExceptCompare.indexOf($scenarioName);
        if (index > 0) {
            $scenarioName = allScenariosExceptCompare[index - 1];
        }
        changeScenario();
    }
    function increaseScenario() {
        const index = allScenariosExceptCompare.indexOf($scenarioName);
        if (index < allScenariosExceptCompare.length - 1) {
            $scenarioName = allScenariosExceptCompare[index + 1];
        }
        changeScenario();
    }
    function decreaseCompareScenario() {
        const index =
            allCompareScenariosExceptMain.indexOf($compareScenarioName);
        if (index > 0) {
            $compareScenarioName = allCompareScenariosExceptMain[index - 1];
        }
        changeScenario();
    }
    function increaseCompareScenario() {
        const index =
            allCompareScenariosExceptMain.indexOf($compareScenarioName);
        if (index < allCompareScenariosExceptMain.length - 1) {
            $compareScenarioName = allCompareScenariosExceptMain[index + 1];
        }
        changeScenario();
    }

    let scenario: Scenario;
    let descriptionLines: string[];
    let compareScenario: Scenario | null;
    let compareDescriptionLines: string[] | null;

    $: {
        scenario = $allScenarios.get($scenarioName);
        compareScenario =
            $compareScenarioName === null
                ? null
                : $allScenarios.get($compareScenarioName);

        descriptionLines = scenario.metadata.description.replace(/\r/g, "").split(/\n+/),
        compareDescriptionLines =
            $compareScenarioName === null
                ? null
                : compareScenario.metadata.description
                      .replace(/\r/g, "")
                      .split(/\n+/);

        allScenariosExceptCompare = allScenarioNames.filter(
            (s) => s !== $compareScenarioName
        );
        decreaseScenarioOk = $scenarioName !== allScenariosExceptCompare[0];
        increaseScenarioOk =
            $scenarioName !==
            allScenariosExceptCompare[allScenariosExceptCompare.length - 1];

        allCompareScenariosExceptMain = [
            null,
            ...allScenarioNames.filter((s) => s !== $scenarioName),
        ];
        decreaseCompareScenarioOk =
            $compareScenarioName !== allCompareScenariosExceptMain[0];
        increaseCompareScenarioOk =
            $compareScenarioName !==
            allCompareScenariosExceptMain[
                allCompareScenariosExceptMain.length - 1
            ];
    }
</script>

Select a scenario and compare it against the baseline to see the impact of the
modelled development strategies on any of the four indicators.

<div id="main-scenario">
    <h3>Main scenario</h3>
    <Export />
</div>

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
    <select id="scenario" bind:value={$scenarioName} on:change={changeScenario}>
        {#each [...$allScenarios.entries()] as [name, scenario]}
            <option value={name}>{scenario.metadata.long}</option>
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
        <span class="instruction"
            >{descriptionVisible
                ? "hide description"
                : "show description"}</span
        >
        <span class="small-icon">{descriptionVisible ? "∧" : "∨"}</span>
    </button>
</div>

{#if descriptionVisible}
    <div id="scenario-description-container" transition:slide|local>
        {#key $scenarioName}
            <div
                id="scenario-description"
                in:customFlyIn|local
                out:customFlyOut|local
                on:outrostart={setMaxHeightToZero}
            >
                <p>{descriptionLines[0]}</p>
                {#each descriptionLines.slice(1) as para}
                    <p>{para}</p>
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
            src={decreaseCompareScenarioOk ? leftIcon : leftIconDisabled}
            alt="Decrease compare scenario"
        />
    </button>
    <select
        id="compare"
        bind:value={$compareScenarioName}
        on:change={changeScenario}
    >
        <option value={null}>None</option>
        {#each [...$allScenarios.entries()] as [name, compareScenario]}
            {#if name !== $scenarioName}
                <option value={name}>{compareScenario.metadata.long}</option>
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
    {#if $compareScenarioName !== null}
        <button
            class="toggle-description"
            on:click={toggleCompareDescriptionVisible}
            transition:slide|local={{ duration: 300 }}
        >
            <span class="instruction"
                >{compareDescriptionVisible
                    ? "hide description"
                    : "show description"}</span
            >
            <span class="small-icon"
                >{compareDescriptionVisible ? "∧" : "∨"}</span
            >
        </button>
    {/if}
</div>

{#if compareDescriptionVisible && $compareScenarioName !== null}
    <div id="compare-scenario-description-container" transition:slide|local>
        {#key $compareScenarioName}
            <div
                id="compare-scenario-description"
                in:customFlyInCmp|local
                out:customFlyOutCmp|local
                on:outrostart={setMaxHeightToZero}
            >
                <p>{compareDescriptionLines[0]}</p>
                {#each compareDescriptionLines.slice(1) as para}
                    <p>{para}</p>
                {/each}
            </div>
        {/key}
    </div>
{/if}

<style>
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
        font-family: inherit;
        grid-column: 2 / 3;
        background-color: #ffffff;
        border: 0px;
        color: #565656;
    }
    button.toggle-description:hover {
        color: #303030;
        cursor: pointer;
    }
    button.toggle-description:hover > span.instruction {
        text-decoration: underline;
    }
    span.small-icon {
        margin-left: 3px;
        font-size: 80%;
        position: relative;
        top: -1px;
    }

    img.control-arrows {
        width: 8px;
        padding-bottom: 1px;
    }

    select {
        font-family: inherit;
        width: 100%;
    }
    h3 {
        font-size: 100%;
        font-weight: bold;
    }

    div#main-scenario {
        display: grid;
        grid-template-columns: 1fr max-content;
        align-items: center;
    }

    div#scenario-description-container,
    div#compare-scenario-description-container {
        padding-top: 5px;
        display: grid;
    }
    div#scenario-description,
    div#compare-scenario-description {
        grid-column: 1;
        grid-row: 1;
    }
    div#scenario-description > :first-child,
    div#compare-scenario-description > :first-child {
        margin-top: 0 !important;
    }
    div#scenario-description > :last-child,
    div#compare-scenario-description > :last-child {
        margin-bottom: 0 !important;
    }
</style>
