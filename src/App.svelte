<script lang="ts">
    import "maplibre-gl/dist/maplibre-gl.css";
    import maplibregl from "maplibre-gl";
    import baselineJsonRaw from "./assets/baseline_oa.json?raw";
    import { onMount, onDestroy } from "svelte";
    import Chart from "./lib/Chart.svelte";
    import Sidebar from "./lib/Sidebar.svelte";
    import Indicators from "./lib/Indicators.svelte";
    import { allIndicators, type Indicator } from "./indicators";
    import { mergeGeographyWithIndicators, makeChartData } from "./utils";

    // The indicator which should be shown when the page first loads
    export let initialIndicator: Indicator = "air_quality";
    // The values of the four indicators for the OA which the user has hovered
    // over. Null if no OA is being hovered over.
    let indicatorValues: object | null = null;
    // The numeric ID of the OA being hovered over.
    let hoveredId: number | null = null;
    // The map!
    let map: maplibregl.Map;
    // The data to be sent to the chart
    let chartData: { colors: string[]; values: number[]; counts: number[] };

    // Generate data for the baseline
    const baseline = mergeGeographyWithIndicators(baselineJsonRaw);
    chartData = makeChartData(baseline, initialIndicator, 20);

    // Setup scripts. We have to use Svelte's 'onMount' because the code in
    // this script is run before the DOM is generated.
    onMount(() => {
        // Create map
        map = new maplibregl.Map({
            container: "map",
            style: "https://api.maptiler.com/maps/uk-openzoomstack-road/style.json?key=g6kCkRKHQMJqJMcThytt",
            center: [-1.66, 54.94],
            zoom: 10.05,
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

        window.addEventListener('resize', () => map.resize());

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
    });

    onDestroy(() => {
        map.remove();
    });

    // Update layer opacity when the display indicator changes
    function updateLayers(event: CustomEvent<{ indicator: Indicator }>) {
        const newIndicator = event.detail.indicator;
        if (map) {
            for (const indicator of allIndicators) {
                map.setPaintProperty(
                    `${indicator}-layer`,
                    "fill-opacity",
                    indicator === newIndicator ? 0.8 : 0.01
                );
            }
        }
        chartData = makeChartData(baseline, newIndicator, 20);
    }
</script>

<main>
    <Sidebar />
    <Indicators
        currentIndicator={initialIndicator}
        {indicatorValues}
        on:indicatorChange={updateLayers}
    />
    <Chart currentIndicator={initialIndicator} data={chartData} />

    <div id="map" />
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
