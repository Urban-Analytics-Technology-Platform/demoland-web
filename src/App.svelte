<script lang="ts">
    import "maplibre-gl/dist/maplibre-gl.css";
    import maplibregl from "maplibre-gl";
    import { onMount, onDestroy } from "svelte";
    import LeftSidebar from "./lib/LeftSidebar.svelte";
    import RightSidebar from "./lib/RightSidebar.svelte";
    import Welcome from "./lib/Welcome.svelte";
    import { makePopup } from "./hover";
    import {
        allFactors,
        allScenarios,
        type FactorName,
        type ScenarioName,
        type CompareView,
    } from "./constants";
    import { makeCombinedGeoJSON, getGeometryBounds } from "./utils";

    /* --------- STATE VARIABLES ---------------------------------------- */

    // Whether the welcome screen should be shown
    const welcomeVisible: boolean = !(
        localStorage.getItem("doNotShowWelcome") === "true"
    );
    // The layer for the OA data
    const NEWCASTLE_LAYER = "newcastle-layer";
    // The currently active indicator
    let activeFactor: FactorName = "sig";
    // The numeric ID of the OA being hovered over.
    let hoveredId: number | null = null;
    // The popup shown when hovering over an OA
    let hoverPopup: maplibregl.Popup | null = null;
    // The feature corresponding to the OA that was clicked on. Null if no OA
    // was clicked on.
    let clickedId: number | null = null;
    // The popup shown when clicking on an OA
    let clickPopup: maplibregl.Popup | null = null;
    // Initial scenario to show
    let scenarioName: ScenarioName = "baseline";
    // Scenario to compare against. Null to not compare.
    let compareScenarioName: ScenarioName | null = null;
    // Method to visualise scenario comparison
    let compareView: CompareView = "difference";
    // The map object
    let map: maplibregl.Map;
    // The data to be plotted on the map
    let mapData: GeoJSON.FeatureCollection = makeCombinedGeoJSON(
        scenarioName,
        compareScenarioName
    );
    // Whether the re-centre button needs to be shown
    let offcentre: boolean = false;
    // Initial longitude and latitude
    let initialCentre: maplibregl.LngLatLike = [-1.59, 54.94];
    // Initial zoom
    let initialZoom: number = 10.05;
    // Initial opacity
    let opacity: number = 0.8;

    /* --------- HELPERS ------------------------------------------------ */

    // Set div#map to have 100vw and 100vh height
    function resizeContainer() {
        if (document.getElementById("map")) {
            document.getElementById(
                "map"
            ).style.height = `${window.innerHeight}px`;
            document.getElementById(
                "map"
            ).style.width = `${window.innerWidth}px`;
        }
        if (map) map.resize();
    }

    // Returns true if the centre of the given OA overlaps with either the left or right sidebars
    function oaInWindowEdge(
        oaBounds: maplibregl.LngLatBounds,
        mapBounds: maplibregl.LngLatBounds
    ) {
        const lng = oaBounds.getCenter().lng;
        const w = mapBounds.getWest();
        const e = mapBounds.getEast();
        const x = (window.innerWidth * (lng - w)) / (e - w);
        // 340 = padding of other-content-container + width of sidebar
        // 290 = padding of other-content-container + width of right-container
        return x < 340 || x > window.innerWidth - 290;
    }

    // Callback to be run when a click popup is closed (either via the close
    // button, or when the user clicks somewhere else on the map). Note: this
    // does not remove a popup. It is to be called when the popup is removed.
    function clickPopupCleanup() {
        if (clickedId !== null) {
            map.setFeatureState(
                { source: NEWCASTLE_LAYER, id: clickedId },
                { click: false }
            );
            clickedId = null;
        }
    }

    // Disable the currently active hover state, and remove the popup.
    function disableHover() {
        if (hoveredId !== null) {
            map.setFeatureState(
                { source: NEWCASTLE_LAYER, id: hoveredId },
                { hover: false }
            );
            hoveredId = null;
        }
        if (hoverPopup !== null) {
            hoverPopup.remove();
        }
    }

    // Activate hover state on the map for the feature with the given numeric
    // ID. Note: this does not generate a popup.
    function enableHover(featureId: number) {
        map.setFeatureState(
            { source: NEWCASTLE_LAYER, id: featureId },
            { hover: true }
        );
    }

    // Activate click state on the map for the feature with the given numeric
    // ID. Note: this does not generate a popup.
    function enableClick(featureId: number) {
        map.setFeatureState(
            { source: NEWCASTLE_LAYER, id: featureId },
            { click: true }
        );
    }

    /* --------- SETUP FUNCTIONS - MAP CREATION ------------------------- */

    // We have to use Svelte's 'onMount' so that the code here is only executed
    // after the DOM is generated.
    onMount(() => {
        resizeContainer();
        // Create map
        map = new maplibregl.Map({
            container: "map",
            style: "https://api.maptiler.com/maps/uk-openzoomstack-light/style.json?key=g6kCkRKHQMJqJMcThytt",
            center: initialCentre,
            zoom: initialZoom,
            hash: true,
        });

        // Add in sources and create layers
        map.on("load", function () {
            drawLayers(mapData);
        });

        // Add hover functionality.
        // It doesn't matter which of the five polygon layers we add it to;
        // however, we have to choose one of them and *not* the line layer,
        // because the hover effect for the line layer only triggers when the
        // mouse is placed directly on a border.
        // Refer to https://maplibre.org/maplibre-gl-js-docs/example/hover-styles/
        map.on("mousemove", "air_quality-layer", function (e) {
            if (e.features.length > 0) {
                disableHover();
                const feat = e.features[0];
                hoveredId = feat.id as number;
                if (hoveredId !== clickedId) {
                    enableHover(hoveredId);
                    hoverPopup = makePopup(
                        map,
                        feat,
                        compareScenarioName,
                        activeFactor,
                        false
                    );
                }
            }
        });
        map.on("mouseleave", "air_quality-layer", disableHover);

        // Add click functionality
        map.on("click", "air_quality-layer", function (e) {
            // preventDefault usage: see https://stackoverflow.com/a/54413030
            // This prevents the 'normal' onclick behaviour (above) when the
            // user clicks on an OA
            e.preventDefault();
            if (e.features.length > 0) {
                // Clicked on an OA
                const feat = e.features[0];
                if (clickPopup !== null) {
                    clickPopup.remove();
                }
                clickedId = feat.id as number;
                enableClick(clickedId);
                // Centre map on that OA if the new div would obscure it.
                const oaBounds = getGeometryBounds(feat.geometry);
                if (oaInWindowEdge(oaBounds, map.getBounds())) {
                    map.flyTo({
                        center: oaBounds.getCenter(),
                        speed: 0.5,
                    });
                }
                clickPopup = makePopup(
                    map,
                    feat,
                    compareScenarioName,
                    activeFactor,
                    true
                );
                clickPopup.on("close", clickPopupCleanup);
            }
        });

        map.on("click", function (e) {
            if (!e.defaultPrevented) {
                // Clicked outside an OA
                if (clickPopup !== null) {
                    clickPopup.remove();
                }
            }
        });

        // Detect whether the map is off-centre. This determines whether the
        // 're-centre' button is shown or not.
        map.on("move", function () {
            const bounds = map.getBounds();
            offcentre =
                map.getZoom() < 6 ||
                bounds.getWest() > -1.35 ||
                bounds.getEast() < -1.855 ||
                bounds.getNorth() < 54.8 ||
                bounds.getSouth() > 55.08;
        });

        map.resize();
    });

    onDestroy(() => {
        map.remove();
    });

    // Draw the map layers. This should only be called when the map is
    // initialised. After it's been set up, we don't need to redraw the layers,
    // we just update the underlying data or styles.
    function drawLayers(mapData: GeoJSON.GeoJsonObject) {
        map.addSource(NEWCASTLE_LAYER, {
            type: "geojson",
            data: mapData,
            // need to give the features numeric IDs for the click/hover to work
            promoteId: "id",
        });

        // Generate all polygon layers with an initial opacity of 0.01.
        //
        // The choice to use five different layers here --- one per factor ---
        // seems to be suboptimal at first glance. Indeed, virtually all the
        // same functionality can be accomplished by using only one layer, and
        // toggling fill-color when the active indicator is changed. However,
        // fill-color is a data-driven property, and these do not work with
        // transitions: see https://github.com/mapbox/mapbox-gl-js/issues/3170.
        // (MapLibre, as a fork of Mapbox, inherits this issue.) So, changing
        // the fill-color leads to a 'flickering' effect when the active
        // indicator is changed. The way around it is to use fill-opacity
        // (which is not data-driven) for four different layers. The only real
        // drawback is (in principle) performance, but I haven't really noticed
        // any issues so far.
        for (const factor of allFactors) {
            const layerName = `${factor.name}-layer`;
            map.addLayer({
                id: layerName,
                type: "fill",
                source: NEWCASTLE_LAYER,
                layout: {},
                paint: {
                    "fill-color": [
                        "get",
                        compareScenarioName === null ||
                        compareView === "original"
                            ? `${factor.name}-color`
                            : `${factor.name}-diff-color`,
                    ],
                    "fill-opacity": 0.01,
                    // @ts-ignore: Suppressing a known bug https://github.com/maplibre/maplibre-gl-js/issues/1708
                    "fill-opacity-transition": { duration: 300 },
                },
            });
        }

        // Generate a line layer to display the borders of each OA.
        map.addLayer({
            id: "line-layer",
            type: "line",
            source: NEWCASTLE_LAYER,
            layout: {},
            paint: {
                "line-color": "#ffffff",
                "line-width": [
                    "case",
                    ["boolean", ["feature-state", "click"], false],
                    3,
                    ["boolean", ["feature-state", "hover"], false],
                    1.5,
                    0,
                ],
                "line-opacity": 0.01,
                // @ts-ignore: Suppressing a known bug
                // https://github.com/maplibre/maplibre-gl-js/issues/1708
                "line-opacity-transition": { duration: 300 },
            },
        });

        // Generate the LineString layer showing the boundary of the changed
        // areas.
        const scenario = allScenarios.find((s) => s.name === scenarioName);
        map.addSource("boundary", {
            type: "geojson",
            data: scenario.boundary,
        });
        map.addLayer({
            id: "boundary-layer",
            type: "line",
            source: "boundary",
            layout: {},
            paint: {
                "line-color": "#000",
                "line-width": 2.5,
            },
        });

        // Fade in the layers that we want, after a small delay to allow for
        // loading.
        setTimeout(function () {
            for (const factor of allFactors) {
                const layerName = `${factor.name}-layer`;
                map.setPaintProperty(
                    layerName,
                    "fill-opacity",
                    factor.name === activeFactor ? opacity : 0.01 * opacity
                );
            }
            map.setPaintProperty("line-layer", "line-opacity", opacity);
        }, 200);
    }

    /* --------- HELPERS FOR EVENT HANDLERS ----------------------------- */

    // Update the underlying data plotted by the map layers. This should be
    // called whenever the indicator values are changed (i.e. when the
    // scenario or comparison scenario are changed).
    function updateMapData(mapData: GeoJSON.FeatureCollection) {
        if (map) {
            (
                map.getSource(NEWCASTLE_LAYER) as maplibregl.GeoJSONSource
            ).setData(mapData);
            updateLayers();
        }
    }

    // Update layer styles. This is quite a general function --- it updates the
    // fill colours and opacity again according to the underlying data as well
    // as the opacity slider.
    function updateLayers() {
        if (map) {
            for (const factor of allFactors) {
                map.setPaintProperty(`${factor.name}-layer`, "fill-color", [
                    "get",
                    compareScenarioName === null || compareView === "original"
                        ? `${factor.name}-color`
                        : `${factor.name}-diff-color`,
                ]);
                map.setPaintProperty(
                    `${factor.name}-layer`,
                    "fill-opacity",
                    factor.name === activeFactor ? opacity : 0.01 * opacity
                );
            }
            map.setPaintProperty("line-layer", "line-opacity", opacity);
        }
        // Update the LineString layer
        const scenario = allScenarios.find((s) => s.name === scenarioName);
        const boundarySource = map.getSource(
            "boundary"
        ) as maplibregl.GeoJSONSource;
        boundarySource.setData(scenario.boundary);
        // Update the hover
        refreshClickedFeature(mapData);
    }

    // Refresh the click popup whenever the underlying data is changed. This is
    // necessary because the click popup contains indicator values etc.
    function refreshClickedFeature(mapData: GeoJSON.FeatureCollection) {
        if (clickedId !== null) {
            // Have to save it here because clickPopup.remove() will remove it
            const tmpClickedId = clickedId;
            // Remove popup
            if (clickPopup !== null) {
                clickPopup.remove();
            }
            // Regenerate popup
            clickedId = tmpClickedId;
            enableClick(clickedId);
            const feat = mapData.features.find((feat) => feat.id === clickedId);
            clickPopup = makePopup(
                map,
                feat,
                compareScenarioName,
                activeFactor,
                true
            );
            clickPopup.on("close", clickPopupCleanup);
        }
    }

    /* --------- EVENT HANDLERS ----------------------------------------- */

    // Redraw layers when scenario is changed
    function updateScenario() {
        mapData = makeCombinedGeoJSON(scenarioName, compareScenarioName);
        updateMapData(mapData);
    }

    // Redraw layers when compareScenario is changed
    function updateCompareScenario() {
        // reset compareView
        if (compareScenarioName === null) {
            compareView = "original";
        }
        // show difference if possible
        if (activeFactor !== "sig" && compareView === "original") {
            compareView = "difference";
        }
        mapData = makeCombinedGeoJSON(scenarioName, compareScenarioName);
        updateMapData(mapData);
    }

    // Recentre map on Newcastle when button is clicked
    function recentreMap() {
        if (map) {
            map.flyTo({
                center: initialCentre,
                zoom: initialZoom,
                speed: 1.5,
            });
        }
    }
</script>

<main>
    <div id="map" />

    <Welcome {welcomeVisible} />

    <div id="other-content-container">
        <LeftSidebar
            bind:scenarioName
            bind:compareScenarioName
            bind:compareView
            on:changeScenario={updateScenario}
            on:changeCompareScenario={updateCompareScenario}
            on:changeCompareView={updateLayers}
        />

        <div id="recentre">
            {#if offcentre}
                <input
                    type="button"
                    value="Centre map"
                    id="recentre"
                    on:click={recentreMap}
                />
            {/if}
        </div>

        <RightSidebar
            bind:activeFactor
            on:changeFactor={updateLayers}
            bind:opacity
            on:changeOpacity={updateLayers}
            {scenarioName}
            {compareScenarioName}
            {compareView}
        />
    </div>
</main>
<svelte:window on:resize={resizeContainer} />

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
