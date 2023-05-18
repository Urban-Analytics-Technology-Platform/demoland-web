<script lang="ts">
    import "maplibre-gl/dist/maplibre-gl.css";
    import maplibregl from "maplibre-gl";
    import baselineJsonRaw from "../assets/baseline_oa.json?raw";
    import { onMount, onDestroy } from "svelte";
    import { displayIndicator } from "../stores";
    import Sidebar from "./Sidebar.svelte";
    import { allIndicators, } from "../indicators";
    import { mergeGeographyWithIndicators } from "../makeGeometry";

    let map: maplibregl.Map;
    const [baseline, minValues, maxValues] = mergeGeographyWithIndicators(
        baselineJsonRaw
    );

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

        map.on("load", function () {
            map.addSource("newcastle", {
                type: "geojson",
                data: baseline,
            });
            for (const indicator of allIndicators) {
                map.addLayer({
                    id: `${indicator}-layer`,
                    type: "fill",
                    source: "newcastle",
                    layout: {},
                    paint: {
                        "fill-color": ["get", `${indicator}-color`],
                        "fill-opacity": indicator === $displayIndicator ? 0.8 : 0.01,
                    },
                });
            }
        });
    });

    onDestroy(() => {
        map.remove();
    });

    // Update layer visibility when displayIndicator changes
    function updateLayers(event) {
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

<Sidebar on:indicatorChange={updateLayers} />
<div id="map" />

<style>
    div#map {
        width: 100vw;
        height: 100vh;
    }
</style>
