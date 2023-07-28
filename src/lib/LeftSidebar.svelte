<script lang="ts">
    import {
        type ScenarioName,
        type CompareView,
    } from "../constants";
    import Tooltip from "./reusable/Tooltip.svelte";
    import showWelcomeIcon from "../assets/show-welcome.svg";
    import { createEventDispatcher } from "svelte";
    import "overlayscrollbars/overlayscrollbars.css";
    import { overlayScrollbars } from "../utils";
    import { onMount } from "svelte";
    const dispatch = createEventDispatcher();
    import ScenarioSelector from "./leftSidebar/ScenarioSelector.svelte";

    export let scenarioName: ScenarioName;
    export let compareScenarioName: ScenarioName | null;
    export let compareView: CompareView;

    function showWelcome() {
        dispatch("showWelcome", {});
    }

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

    <ScenarioSelector
        bind:scenarioName
        bind:compareScenarioName
        bind:compareView
        on:changeScenario
        on:changeCompareView
    />
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
</style>
