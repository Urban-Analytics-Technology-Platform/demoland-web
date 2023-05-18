<script lang="ts">
    import "maplibre-gl/dist/maplibre-gl.css";
    import maplibregl from "maplibre-gl";
    import baselineJsonRaw from "../assets/baseline_oa.json?raw";
    import { onMount, onDestroy } from "svelte";
    import Sidebar from "./Sidebar.svelte";
    import { allIndicators, type Indicator } from "../indicators";
    import { mergeGeographyWithIndicators } from "../makeGeometry";

    export let initialIndicator: Indicator;
    let indicatorValues: object | null = null;
    let hoveredId: number | null = null;
    let map: maplibregl.Map;

    const [baseline, minValues, maxValues] =
        mergeGeographyWithIndicators(baselineJsonRaw);
    console.log(baseline);

    // Must use onMount because this script is run before the DOM is generated.
    onMount(() => {
        map = new maplibregl.Map({
            container: "map",
            style: "https://api.maptiler.com/maps/uk-openzoomstack-road/style.json?key=g6kCkRKHQMJqJMcThytt",
            center: [-1.66, 54.94],
            zoom: 10.05,
            hash: true,
        });
        map.resize();

        // Add in sources and create layers
        map.on("load", function () {
            map.addSource("newcastle", {
                type: "geojson",
                data: baseline,
                generateId: true, // Generates numeric ids for each feature.
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
        });

        // Add hover functionality.
        // It doesn't matter which of the four indicator layers we add it to;
        // however, we have to choose one of them and *not* the line layer,
        // because the hover effect for the line layer only triggers when the
        // mouse is placed directly on a border.
        // Refer to https://maplibre.org/maplibre-gl-js-docs/example/hover-styles/
        map.on("mousemove", 'air_quality-layer', function (e) {
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
                indicatorValues = new Object();
                for (const indicator of allIndicators) {
                    indicatorValues[indicator] = e.features[0].properties[indicator];
                }
            }
        });
        map.on('mouseleave', 'air_quality-layer', function () {
            if (hoveredId) {
                map.setFeatureState(
                    { source: 'newcastle', id: hoveredId },
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
            console.log(`Current indicator: ${newIndicator}`);
            for (const indicator of allIndicators) {
                map.setPaintProperty(
                    `${indicator}-layer`,
                    "fill-opacity",
                    indicator === newIndicator ? 0.8 : 0.01
                );
            }
        }
    }
</script>

<Sidebar currentIndicator={initialIndicator} {indicatorValues} on:indicatorChange={updateLayers} />
<div id="map" />

<style>
    div#map {
        width: 100vw;
        height: 100vh;
    }
</style>
