<script lang="ts">
    import "maplibre-gl/dist/maplibre-gl.css";
    import maplibregl from "maplibre-gl";
    import { onMount, onDestroy } from "svelte";
    import Chart from "./lib/Chart.svelte";
    import Recentre from "./lib/Recentre.svelte";
    import Sidebar from "./lib/Sidebar.svelte";
    import Indicators from "./lib/Indicators.svelte";
    import Values from "./lib/Values.svelte";
    import {
        allIndicators,
        type IndicatorName,
        type ScenarioName,
    } from "./constants";
    import {
        makeCombinedGeoJSON,
        getGeometryBounds,
    } from "./utils";

    // The currently active indicator
    let activeIndicator: IndicatorName = "air_quality";
    // The numeric ID of the OA being hovered over.
    let hoveredId: number | null = null;
    // The popup shown when hovering over an OA
    let hoverPopup: maplibregl.Popup | null = null;
    // The feature corresponding to the OA that was clicked on. Null if no OA
    // was clicked on.
    let clicked: GeoJSON.Feature | null = null;
    // The map object
    let map: maplibregl.Map;
    // The data to be plotted on the map
    let mapData: GeoJSON.FeatureCollection;
    // Whether the re-centre button needs to be shown
    let offcentre: boolean = false;
    // Initial longitude and latitude
    let initialCentre: maplibregl.LngLatLike = [-1.59, 54.94];
    // Initial zoom
    let initialZoom: number = 10.05;
    // Initial scenario to show
    let scenarioName: ScenarioName = "baseline";
    // Scenario to compare against. Null to not compare.
    let compareScenarioName: ScenarioName | null = null;
    // Initial opacity
    let opacity: number = 1;

    // Generate data for the baseline
    mapData = makeCombinedGeoJSON(scenarioName, compareScenarioName);

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
        // 300 = padding of other-content-container + width of sidebar
        // 270 = padding of other-content-container + width of right-container
        return x < 300 || x > window.innerWidth - 270;
    }

    // Setup scripts. We have to use Svelte's 'onMount' because the code in
    // this script is run before the DOM is generated.
    onMount(() => {
        // Manually update the size of the containing div to be 100vw/100vh.
        resizeContainer();
        // Create map
        map = new maplibregl.Map({
            container: "map",
            style: "https://api.maptiler.com/maps/openstreetmap/style.json?key=g6kCkRKHQMJqJMcThytt",
            center: initialCentre,
            zoom: initialZoom,
            hash: true,
        });

        // Add in sources and create layers
        map.on("load", function () {
            drawLayers(mapData);
        });

        // Add hover functionality.
        // It doesn't matter which of the four indicator layers we add it to;
        // however, we have to choose one of them and *not* the line layer,
        // because the hover effect for the line layer only triggers when the
        // mouse is placed directly on a border.
        // Refer to https://maplibre.org/maplibre-gl-js-docs/example/hover-styles/
        map.on("mousemove", "air_quality-layer", function (e) {
            if (e.features.length > 0) {
                if (hoveredId !== null) {
                    map.setFeatureState(
                        { source: "newcastle", id: hoveredId },
                        { hover: false }
                    );
                }
                hoveredId = e.features[0].id as number;
                map.setFeatureState(
                    { source: "newcastle", id: e.features[0].id },
                    { hover: true }
                );
                if (hoverPopup !== null) {
                    hoverPopup.remove();
                }
                let bounds = getGeometryBounds(e.features[0].geometry);
                hoverPopup = new maplibregl.Popup()
                    .setLngLat([bounds.getCenter().lng, bounds.getNorth()])
                    .setHTML(e.features[0].properties.OA11CD)
                    .addTo(map);
            }
        });
        map.on("mouseleave", "air_quality-layer", function () {
            if (hoveredId) {
                map.setFeatureState(
                    { source: "newcastle", id: hoveredId },
                    { hover: false }
                );
                hoverPopup.remove();
            }
            hoveredId = null;
        });

        // Add click functionality
        map.on("click", "air_quality-layer", function (e) {
            // preventDefault usage: see https://stackoverflow.com/a/54413030
            // This prevents the 'normal' onclick behaviour (above) when the
            // user clicks on an OA
            e.preventDefault();
            if (e.features.length > 0) {
                // Clicked on an OA
                if (clicked !== null) {
                    map.setFeatureState(
                        { source: "newcastle", id: clicked.id },
                        { click: false }
                    );
                }
                clicked = e.features[0];
                map.setFeatureState(
                    { source: "newcastle", id: clicked.id },
                    { click: true }
                );
                // Centre map on that OA if the new div would obscure it.
                const oaBounds = getGeometryBounds(clicked.geometry);
                if (oaInWindowEdge(oaBounds, map.getBounds())) {
                    map.flyTo({
                        center: oaBounds.getCenter(),
                        speed: 0.5,
                    });
                }
            }
        });
        map.on("click", function (e) {
            if (e.defaultPrevented === false) {
                // Clicked outside an OA
                if (clicked.id !== null) {
                    map.setFeatureState(
                        { source: "newcastle", id: clicked.id },
                        { click: false }
                    );
                    clicked = null;
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

    // Draw the map layers. This is called when the map is first created, and also
    // whenever the scenario is changed.
    function drawLayers(mapData: GeoJSON.GeoJsonObject) {
        map.addSource("newcastle", {
            type: "geojson",
            data: mapData,
            // When setting the feature ID to be the OA label (a string),
            // mapLibre wipes them as it can't be converted to a number.
            // See https://github.com/maplibre/maplibre-gl-js/issues/1043.
            // The generateId option generates numeric ids for each feature,
            // enabling the hover functionality.
            generateId: true,
        });
        // The choice to use four different layers here --- one per indicator
        // --- seems to be suboptimal at first glance. Indeed, virtually all
        // the same functionality can be accomplished by using only one layer,
        // and toggling fill-color when the active indicator is changed.
        // However, fill-color is a data-driven property, and these do not work
        // with transitions: see
        // https://github.com/mapbox/mapbox-gl-js/issues/3170. So, changing the
        // fill-color leads to a 'flickering' effect when the active indicator
        // is changed. The way around it is to use fill-opacity (which is not
        // data-driven) for four different layers. The only real drawback is
        // performance, but I haven't really noticed any issues so far.

        // We first generate all layers with an opacity of 0.01.
        for (const indicator of allIndicators) {
            const layerName = `${indicator.name}-layer`;
            map.addLayer({
                id: layerName,
                type: "fill",
                source: "newcastle",
                layout: {},
                paint: {
                    "fill-color": ["get", `${indicator.name}-color`],
                    "fill-opacity": 0.01,
                    // Suppressing a known bug:
                    // https://github.com/maplibre/maplibre-gl-js/issues/1708
                    // @ts-ignore
                    "fill-opacity-transition": { duration: 400 },
                },
            });
        }
        map.addLayer({
            id: "line-layer",
            type: "line",
            source: "newcastle",
            layout: {},
            paint: {
                "line-color": "#000000",
                "line-width": [
                    "case",
                    ["boolean", ["feature-state", "click"], false],
                    3,
                    ["boolean", ["feature-state", "hover"], false],
                    1.5,
                    0.1,
                ],
                "line-opacity": 0.01,
                // Suppressing a known bug:
                // https://github.com/maplibre/maplibre-gl-js/issues/1708
                // @ts-ignore
                "line-opacity-transition": { duration: 400 },
            },
        });

        // Then, we fade the ones we want in, after a small delay to allow for loading.
        setTimeout(function () {
            for (const indicator of allIndicators) {
                const layerName = `${indicator.name}-layer`;
                map.setPaintProperty(
                    layerName,
                    "fill-opacity",
                    indicator.name === activeIndicator
                        ? 0.8 * opacity
                        : 0.01 * opacity
                );
            }
            map.setPaintProperty("line-layer", "line-opacity", opacity);
        }, 100);
    }

    function redrawLayers(mapData: GeoJSON.GeoJsonObject) {
        // Fade out existing layers if necessary
        for (const indicator of allIndicators) {
            const layerName = `${indicator.name}-layer`;
            if (map.getLayer(layerName) !== undefined) {
                map.setPaintProperty(layerName, "fill-opacity", 0.01);
                map.removeLayer(`${indicator.name}-layer`);
            }
        }
        if (map.getLayer("line-layer") !== undefined) {
            map.setPaintProperty("line-layer", "line-opacity", 0.01);
            map.removeLayer("line-layer");
        }
        if (map.getSource("newcastle") !== undefined) {
            map.removeSource("newcastle");
        }
        drawLayers(mapData);
    }

    // Update opacity of all map layers according to the currently active
    // indicator, as well as the value of the opacity slider (which acts as a
    // constant factor to multiply all layers' opacities by).
    function updateLayers() {
        if (map !== null) {
            for (const indicator of allIndicators) {
                map.setPaintProperty(
                    `${indicator.name}-layer`,
                    "fill-opacity",
                    indicator.name === activeIndicator
                        ? 0.8 * opacity
                        : 0.01 * opacity
                );
            }
            map.setPaintProperty("line-layer", "line-opacity", opacity);
        }
    }

    /* Event handlers! */
    // Redraw layers when scenario is changed
    function updateScenario() {
        // This has to be here and not in the $: reactive bit because
        // redrawLayers depends on it (and reactive statements are executed
        // only at the end).
        mapData = makeCombinedGeoJSON(scenarioName, compareScenarioName);
        if (map) {
            redrawLayers(mapData);
            // TODO: very hacky. Can we make this cleaner?
            if (clicked !== null) {
                // the ID needs to be stored separately because id's are only
                // generated when calling map.addSource, it's not in mapData itself

                // One possible workaround is to use numeric ids for the
                // features in the base geojson
                const theId = clicked.id;
                clicked = mapData.features.find(
                    (feature) =>
                        feature.properties.OA11CD === clicked.properties.OA11CD
                );
                clicked.id = theId;
                map.setFeatureState(
                    { source: "newcastle", id: clicked.id },
                    { click: true }
                );
            }
        }
    }
    // Redraw layers when compareScenario is changed
    function updateCompareScenario() {
        console.log("TODO TODO scenario changed to: " + compareScenarioName);
        // TODO: Fix the below
        mapData = makeCombinedGeoJSON(scenarioName, compareScenarioName);
        if (map) {
            redrawLayers(mapData);
        }
    }
    // Recentre map on Newcastle when button is clicked
    function recentreMap(_: CustomEvent<{}>) {
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

    <div id="other-content-container">
        <Sidebar
            bind:scenarioName
            bind:compareScenarioName
            on:changeScenario={updateScenario}
            on:changeCompareScenario={updateCompareScenario}
        />

        {#if offcentre}
            <Recentre on:recentreEvent={recentreMap} />
        {/if}

        <div id="right-container">
            <Indicators
                bind:activeIndicator
                bind:opacity
                on:changeIndicator={updateLayers}
                on:changeOpacity={updateLayers}
            />
            <Chart {activeIndicator} {scenarioName} {compareScenarioName} />
            {#if clicked !== null}
                <Values {activeIndicator} feature={clicked} />
            {/if}
        </div>
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

    div#right-container {
        box-sizing: border-box;
        height: min-content;
        width: 250px;
        min-width: 250px;
        margin: 0px;
        padding: 0px;
        display: flex;
        flex-flow: column nowrap;
        gap: 20px;

        margin-left: auto;
        margin-right: 0px;
        pointer-events: none;
    }
</style>
