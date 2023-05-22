<script lang="ts">
    import "maplibre-gl/dist/maplibre-gl.css";
    import maplibregl from "maplibre-gl";
    import baselineJsonRaw from "./assets/baseline_oa.json?raw";
    import { onMount, onDestroy } from "svelte";
    import Chart from "./lib/Chart.svelte";
    import Recentre from "./lib/Recentre.svelte";
    import Sidebar from "./lib/Sidebar.svelte";
    import Indicators from "./lib/Indicators.svelte";
    import { allIndicators, type Indicator } from "./indicators";
    import {
        mergeGeographyWithIndicators,
        makeChartData,
        type ChartData,
    } from "./utils";
    import { map as mapStore } from "./stores";

    // The indicator which should be shown when the page first loads
    export let initialIndicator: Indicator = "air_quality";
    // The values of the four indicators for the OA which the user has hovered
    // over. Null if no OA is being hovered over.
    let indicatorValues: object | null = null;
    // The numeric ID of the OA being hovered over.
    let hoveredId: number | null = null;
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
    chartData = makeChartData(baseline, initialIndicator, 20);

    // Setup scripts. We have to use Svelte's 'onMount' because the code in
    // this script is run before the DOM is generated.
    onMount(() => {
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
                            indicator === initialIndicator ? 0.8 : 0.01,
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
                        ["boolean", ["feature-state", "hover"], false],
                        3,
                        0.1,
                    ],
                },
            });
            map.resize();
        });

        window.addEventListener("resize", () => map.resize());

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
                indicatorValues = e.features[0].properties;
            }
        });
        map.on("mouseleave", "air_quality-layer", function () {
            if (hoveredId) {
                map.setFeatureState(
                    { source: "newcastle", id: hoveredId },
                    { hover: false }
                );
            }
            hoveredId = null;
            indicatorValues = null;
        });

        map.on("move", function() {
            // TODO: Make a more sophisticated check
            offcentre = map.getZoom() < 6
                || map.getCenter().lng > 1
                || map.getCenter().lng < -4
        });

        mapStore.set(map);
    });

    onDestroy(() => {
        map.remove();
    });

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

    function redrawLayers(
        event: CustomEvent<{ indicator: Indicator; opacity: number }>
    ) {
        chartData = makeChartData(baseline, event.detail.indicator, 20);
        if (map) updateLayers(event.detail.indicator, event.detail.opacity);
    }
    function updateGlobalOpacity(
        event: CustomEvent<{ indicator: Indicator; opacity: number }>
    ) {
        if (map) updateLayers(event.detail.indicator, event.detail.opacity);
    }
</script>

<main>
    <Sidebar />
    <Indicators
        opacityScale={1}
        currentIndicator={initialIndicator}
        {indicatorValues}
        on:indicatorChange={redrawLayers}
        on:opacityChange={updateGlobalOpacity}
    />
    <Chart data={chartData} />

    <div id="map" />

    {#if offcentre}
        <Recentre {initialCentre} {initialZoom} />
    {/if}
</main>

<style>
    main {
        height: 100vh;
        width: 100vw;
        min-height: 700px;
        min-width: 1000px;
    }

    div#map {
        width: 100%;
        height: 100%;
    }
</style>
