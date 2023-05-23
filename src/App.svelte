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
        type Indicator,
        type ScenarioName,
    } from "./constants";
    import {
        makeCombinedGeoJSON,
        makeChartData,
        type ChartData,
        getGeometryBounds,
    } from "./utils";

    // The currently active indicator
    let currentIndicator: Indicator = "air_quality";
    // The numeric ID of the OA being hovered over.
    let hoveredId: number | null = null;
    // The popup shown when hovering over an OA
    let hoverPopup: maplibregl.Popup | null = null;
    // The numeric ID of the OA that was clicked on.
    let clickedId: number | null = null;
    // The values of the four indicators for the OA which the user has clicked
    // over. Null if no OA has been clicked on.
    let clickedValues: object | null = null;
    // The map object
    let map: maplibregl.Map;
    // The data to be plotted on the map
    let mapData: GeoJSON.GeoJsonObject;
    // The data to be sent to the chart
    let chartData: ChartData;
    // Whether the re-centre button needs to be shown
    let offcentre: boolean = false;
    // Initial longitude and latitude
    let initialCentre: maplibregl.LngLatLike = [-1.59, 54.94];
    // Initial zoom
    let initialZoom: number = 10.05;
    // Initial scenario to show
    let currentScenarioName: ScenarioName = "baseline";

    // Generate data for the baseline
    mapData = makeCombinedGeoJSON(currentScenarioName);
    chartData = makeChartData(mapData, currentIndicator, 20);

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
            redrawLayers(mapData);
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
                if (clickedId !== null) {
                    map.setFeatureState(
                        { source: "newcastle", id: clickedId },
                        { click: false }
                    );
                }
                clickedId = e.features[0].id as number;
                map.setFeatureState(
                    { source: "newcastle", id: clickedId },
                    { click: true }
                );
                clickedValues = e.features[0].properties;
                // Centre map on that OA if the new div would obscure it.
                const newDivWouldObscureOA = false; // TODO!
                if (newDivWouldObscureOA) {
                    map.flyTo({
                        center: getGeometryBounds(
                            e.features[0].geometry
                        ).getCenter(),
                        speed: 0.2,
                    });
                }
            }
        });
        map.on("click", function (e) {
            if (e.defaultPrevented === false) {
                // Clicked outside an OA
                if (clickedId !== null) {
                    map.setFeatureState(
                        { source: "newcastle", id: clickedId },
                        { click: false }
                    );
                    clickedId = null;
                }
                clickedValues = null;
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

    // Update opacity of all map layers according to the currently active
    // indicator, as well as the value of the opacity slider (which acts as a
    // constant factor to multiply all layers' opacities by).
    function updateLayers(activeIndicator: Indicator, opacityScale: number) {
        for (const indicator of allIndicators) {
            const newOpacity =
                indicator === activeIndicator
                    ? 0.8 * opacityScale
                    : 0.01 * opacityScale;
            map.setPaintProperty(
                `${indicator}-layer`,
                "fill-opacity",
                newOpacity
            );
        }
        map.setPaintProperty("line-layer", "line-opacity", opacityScale);
    }

    function redrawLayers(mapData: GeoJSON.GeoJsonObject) {
        for (const indicator of allIndicators) {
            if (map.getLayer(`${indicator}-layer`) !== undefined) {
                map.removeLayer(`${indicator}-layer`);
            }
        }
        if (map.getLayer("line-layer") !== undefined) {
            map.removeLayer("line-layer");
        }
        if (map.getSource("newcastle") !== undefined) {
            map.removeSource("newcastle");
        }

        // TODO: Do we need to overwrite instead of addSource?
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
        for (const indicator of allIndicators) {
            map.addLayer({
                id: `${indicator}-layer`,
                type: "fill",
                source: "newcastle",
                layout: {},
                paint: {
                    "fill-color": ["get", `${indicator}-color`],
                    "fill-opacity": indicator === currentIndicator ? 0.8 : 0.01,
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
            },
        });
    }

    /* Event handlers! */
    // Redraw layers when scenario is changed
    function redrawLayersScenario(
        event: CustomEvent<{ scenarioName: ScenarioName }>
    ) {
        currentScenarioName = event.detail.scenarioName;
        mapData = makeCombinedGeoJSON(currentScenarioName);
        chartData = makeChartData(mapData, currentIndicator, 20);
        if (map) {
            redrawLayers(mapData);
        }
    }
    // Redraw layers when indicator is changed
    function redrawLayersIndicator(
        event: CustomEvent<{ indicator: Indicator; opacity: number }>
    ) {
        currentIndicator = event.detail.indicator;
        chartData = makeChartData(mapData, event.detail.indicator, 20);
        if (map) updateLayers(event.detail.indicator, event.detail.opacity);
    }
    // Update opacity of all layers when opacity slider is changed
    function updateGlobalOpacity(
        event: CustomEvent<{ indicator: Indicator; opacity: number }>
    ) {
        if (map) updateLayers(event.detail.indicator, event.detail.opacity);
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
            {currentScenarioName}
            on:changeScenario={redrawLayersScenario}
        />

        {#if offcentre}
            <Recentre on:recentreEvent={recentreMap} />
        {/if}

        <div id="right-container">
            <Indicators
                opacityScale={1}
                {currentIndicator}
                on:indicatorChange={redrawLayersIndicator}
                on:opacityChange={updateGlobalOpacity}
            />
            <Chart data={chartData} />
            {#if clickedId !== null}
                <Values {currentIndicator} values={clickedValues} />
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
        pointer-events: auto;
    }
</style>
