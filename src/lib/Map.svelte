<script lang="ts">
    import "maplibre-gl/dist/maplibre-gl.css";
    import maplibregl from "maplibre-gl";
    import newcastleJsonRaw from "../assets/newcastle.geojson?raw";
    import baselineJsonRaw from "../assets/baseline_oa.json?raw";
    import { onMount, onDestroy } from "svelte";
    import { displayIndicator } from '../stores';
    import { type Indicator } from '../types';

    let map: maplibregl.Map;
    let allIndicators: Indicator[] = ["air_quality", "house_price", "job_accessibility", "greenspace_accessibility"];

    // Todo: Document the function
    function mergeGeographyWithIndicators (geographyRaw: string, indicatorsRaw: string) {
        const geography = JSON.parse(geographyRaw);
        const indicators = JSON.parse(indicatorsRaw);
        geography["features"] = geography["features"].map(function (feature: object) {
            const oaName = feature["properties"]["geo_code"];
            const oaValues = indicators[oaName];
            if (oaValues === undefined) {
                console.log(`${oaName} not found in values!`);
            } else {
                for (const key in oaValues) {
                    feature["properties"][key] = oaValues[key];
                }
            }
            return feature;
        });
        const minValues = new Object();
        const maxValues = new Object();
        // TODO write better code
        for (let indicator of allIndicators) {
            minValues[indicator] = Math.min(...Object.values(indicators).map((o: object) => o[indicator]));
            maxValues[indicator] = Math.max(...Object.values(indicators).map((o: object) => o[indicator]));
        }
        console.log(minValues);
        console.log(maxValues);
        // TODO give this return type some structure
        return [geography, minValues, maxValues];
    }
    const [baseline, minValues, maxValues] = mergeGeographyWithIndicators(newcastleJsonRaw, baselineJsonRaw);
   
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
                    layout: {
                        // visibility: indicator === $displayIndicator ? "visible" : "none",
                    },
                    paint: {
                        "fill-color": [
                            "rgb",
                            ["*", ["number", 255], ["/", ["-", ["get", indicator], ["number", minValues[indicator]]], ["number", maxValues[indicator] - minValues[indicator]]]],
                            ["*", ["number", 255], ["/", ["-", ["get", indicator], ["number", minValues[indicator]]], ["number", maxValues[indicator] - minValues[indicator]]]],
                            ["*", ["number", 255], ["/", ["-", ["get", indicator], ["number", minValues[indicator]]], ["number", maxValues[indicator] - minValues[indicator]]]],
                            ],
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
    displayIndicator.subscribe((newIndicator: Indicator) => {
        if (map) {
            console.log(`Current indicator: ${newIndicator}`);
            for (const indicator of allIndicators) {
                map.setPaintProperty(`${indicator}-layer`, 'fill-opacity', indicator === newIndicator ? 0.8 : 0.01);
            }
        }
    });
</script>

<div id="map" />

<style>
    div#map {
        width: 100vw;
        height: 100vh;
    }
</style>
