<script lang="ts">
    import LeftSidebar from "src/lib/LeftSidebar.svelte";
    import RightSidebar from "src/lib/RightSidebar.svelte";
    // MapC to avoid clash with JavaScript Map
    import MapC from "src/lib/MapC.svelte";
    import InitialErrorScreen from "src/lib/InitialErrorScreen.svelte";
    import LoadingScreen from "src/lib/LoadingScreen.svelte";
    import { type LayerName, config } from "src/config";
    import {
        allScenarios,
        scenarioName,
        compareScenarioName,
        scaleFactors,
        validAreaNames,
    } from "src/stores";
    import {
        setupReferenceScenarioUnscaled,
        setupScenarioMap,
        setupScaleFactors,
        setupAreaNames,
    } from "src/initialise";

    /* --------- STATE VARIABLES ---------------------------------------- */

    // The currently active map layer
    let activeLayer: LayerName = "signature_type";
    // Initial opacity
    let opacity: number = 0.8;
    // Whether the re-centre button needs to be shown
    let offcentre: boolean;

    /* --------- APP INITIALISATION ------------------------------------- */
    let appState: "loading" | "error" | "ready" = "loading";
    let appErrorMessage: string = "";
    try {
        // See src/initialise.ts for descriptions.
        const referenceScenarioUnscaled = setupReferenceScenarioUnscaled();
        $scaleFactors = setupScaleFactors(referenceScenarioUnscaled);
        $validAreaNames = setupAreaNames(referenceScenarioUnscaled);
        $allScenarios = setupScenarioMap($scaleFactors, $validAreaNames);
        // Set the initial scenario name to the reference scenario, and the
        // scenario being compared against to nothing
        $scenarioName = referenceScenarioUnscaled.metadata.name;
        $compareScenarioName = null;
        console.log(`App initialised with ${$allScenarios.size} scenarios.`);
        console.log(`Scenario names: ${Array.from($allScenarios.keys())}`);
        console.log(`Initial scenario: ${$scenarioName}`);
        // Show the app
        appState = "ready";
    } catch (e) {
        console.error(e);
        appErrorMessage = e.toString();
        // Show an error screen.
        appState = "error";
    }

    // Pass event handlers to map component
    let mapC: MapC;
    function updateScenario() {
        mapC.updateScenario();
    }
    function updateLayers() {
        mapC.updateLayers();
    }
    function updateBoundaryLayer() {
        mapC.updateBoundaryLayer();
    }
    function recentreMap() {
        mapC.recentre();
    }
</script>

<svelte:head>
    <title>Land Use Demonstrator • {config.areaName}</title>
</svelte:head>
{#if appState === "ready"}
    <main>
        <MapC bind:this={mapC} bind:offcentre bind:activeLayer bind:opacity />

        <div id="other-content-container">
            <LeftSidebar
                on:changeScenario={updateScenario}
                on:updateBoundaryLayer={updateBoundaryLayer}
            />

            <div id="recentre">
                {#if offcentre}
                    <input
                        type="button"
                        value="Reset view"
                        id="recentre"
                        on:click={recentreMap}
                    />
                {/if}
            </div>

            <RightSidebar
                bind:activeLayer
                on:changeLayer={updateLayers}
                bind:opacity
                on:changeOpacity={updateLayers}
            />
        </div>
    </main>
{:else if appState === "error"}
    <InitialErrorScreen bind:appErrorMessage />
{:else if appState === "loading"}
    <LoadingScreen />
{/if}
<svelte:window on:resize={mapC.resizeContainer} />

<style>
    div#other-content-container {
        --padding: 20px;
        position: absolute;
        top: 0px;
        left: 0px;
        width: 100vw;
        display: flex;
        flex-flow: row nowrap;
        align-items: flex-start;
        padding: var(--padding);
        gap: var(--padding);
        pointer-events: none;
    }

    div#recentre {
        margin-left: auto;
        margin-right: auto;
        pointer-events: auto;
        min-width: 95px;
    }

    input#recentre {
        font-size: 14px;
        text-decoration: underline;
        border-radius: 10px;
        opacity: 90%;
        box-sizing: border-box;
        padding: 5px;
        background-color: #e8e8e8; /* grey */
    }
</style>
