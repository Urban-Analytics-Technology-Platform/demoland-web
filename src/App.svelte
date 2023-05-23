<script lang="ts">
    import "maplibre-gl/dist/maplibre-gl.css";
    import maplibregl from "maplibre-gl";
    import baselineJsonRaw from "./assets/baseline_oa.json?raw";
    import { onMount, onDestroy } from "svelte";
    import Chart from "./lib/Chart.svelte";
    import Recentre from "./lib/Recentre.svelte";
    import Sidebar from "./lib/Sidebar.svelte";
    import Indicators from "./lib/Indicators.svelte";
    import Values from "./lib/Values.svelte";
    import { allIndicators, type Indicator } from "./indicators";
    import {
        mergeGeographyWithIndicators,
        makeChartData,
        type ChartData,
        getPolygonBounds,
    } from "./utils";

    // The currently active indicator
    export let currentIndicator: Indicator = "air_quality";
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
    // The data to be sent to the chart
    let chartData: ChartData;
    // Whether the re-centre button needs to be shown
    let offcentre: boolean = false;
    // Initial longitude and latitude
    let initialCentre: maplibregl.LngLatLike = [-1.59, 54.94];
    // Initial zoom
    let initialZoom: number = 10.05;

    // Generate data for the baseline
    const baseline = mergeGeographyWithIndicators(baselineJsonRaw);
    chartData = makeChartData(baseline, currentIndicator, 20);

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
            map.addSource("newcastle", {
                type: "geojson",
                data: baseline,
                // When setting the feature ID to be the OA label (a string),
                // mapLibre wipes them as it can't be converted to a number.
                // See https://github.com/maplibre/maplibre-gl-js/issues/1043.
                // Th generateId option generates numeric ids for each feature,
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
                        "fill-opacity":
                            indicator === currentIndicator ? 0.8 : 0.01,
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
                let bounds = getPolygonBounds(e.features[0].geometry.coordinates[0]);
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
                const newDivWouldObscureOA = false;  // TODO!
                if (newDivWouldObscureOA) {
                    map.flyTo({
                        center: getPolygonBounds(e.features[0].geometry.coordinates[0]).getCenter(),
                        speed: 0.2,
                    });
                }
            }
        });
        map.on("click", function(e) {
            if (e.defaultPrevented === false) {
                // Clicked outside an OA
                console.log(clickedId);
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

    /* Event handlers! */
    // Redraw layers when indicator is changed
    function redrawLayers(
        event: CustomEvent<{ indicator: Indicator; opacity: number }>
    ) {
        currentIndicator = event.detail.indicator;
        chartData = makeChartData(baseline, event.detail.indicator, 20);
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

    <Sidebar />

    {#if offcentre}
        <Recentre on:recentreEvent={recentreMap} />
    {/if}
    
    <div id="right-container">
        <Indicators
            opacityScale={1}
            {currentIndicator}
            on:indicatorChange={redrawLayers}
            on:opacityChange={updateGlobalOpacity}
        />
        <Chart data={chartData} />
        {#if clickedId !== null}
            <Values {currentIndicator} values={clickedValues} />
        {/if}
    </div>
</main>
<svelte:window on:resize={resizeContainer} />

<style>
    div#right-container {
        --margin: 40px;
        box-sizing: border-box;
        position: absolute;
        height: min-content;
        width: 300px;
        top: var(--margin);
        right: var(--margin);
        margin: 0px;
        padding: 0px;
        z-index: 1;
        display: flex;
        flex-flow: column nowrap;
        gap: 20px;
    }
</style>
