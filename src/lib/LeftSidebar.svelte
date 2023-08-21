<script lang="ts">
    import Tooltip from "./reusable/Tooltip.svelte";
    import showWelcomeIcon from "../assets/show-welcome.svg";
    import { createEventDispatcher } from "svelte";
    import "overlayscrollbars/overlayscrollbars.css";
    import { overlayScrollbars } from "../utils";
    import { onMount } from "svelte";
    const dispatch = createEventDispatcher();
    import Choose from "./leftSidebar/Choose.svelte";
    import Create from "./leftSidebar/Create.svelte";
    import Import from "./leftSidebar/Import.svelte";

    export let scenarioName: string;
    export let compareScenarioName: string | null;
    export let clickedOAName: string | null;

    function showWelcome() {
        dispatch("showWelcome", {});
    }

    let selectedTab: "choose" | "create" | "import" = "choose";

    onMount(() => {
        overlayScrollbars("sidebar");
    });
</script>

<div id="sidebar" class="data-overlayscrollbars-initialize">
    <h1 class="title">Tyne and Wear development scenario modelling</h1>

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

    <p>All indicator values range from 0 to 100.</p>

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
            <label for="choose" class="tab-label">View scenarios</label>

            <input
                type="radio"
                class="tab-input"
                id="create"
                bind:group={selectedTab}
                value="create"
                on:click={() => {
                    compareScenarioName = null;
                    dispatch("changeScenario");
                }}
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
                <Choose
                    bind:scenarioName
                    bind:compareScenarioName
                    on:changeScenario
                />
            {:else if selectedTab === "create"}
                <Create
                    bind:scenarioName
                    bind:clickedOAName
                    on:changeScenario
                    on:import={(e) => {
                        selectedTab = "choose";
                        scenarioName = e.detail.name;
                        compareScenarioName = null;
                        dispatch("changeScenario");
                    }}
                />
            {:else if selectedTab === "import"}
                <Import
                    on:import={(e) => {
                        selectedTab = "choose";
                        scenarioName = e.detail.name;
                        compareScenarioName = null;
                        dispatch("changeScenario");
                    }}
                />
            {/if}
        </div>
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

        margin-left: 0px;
        margin-right: auto;
        pointer-events: auto;
    }

    h1.title {
        margin-top: 0px !important;
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
</style>
