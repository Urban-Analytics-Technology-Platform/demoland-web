<script lang="ts">
    import "maplibre-gl/dist/maplibre-gl.css";
    import maplibregl from "maplibre-gl";
    import { onMount, onDestroy } from "svelte";
    import LeftSidebar from "./lib/LeftSidebar.svelte";
    import RightSidebar from "./lib/RightSidebar.svelte";
    import {
        allFactors,
        type FactorName,
        allIndicators,
        type Indicator,
        type ScenarioName,
        type CompareView,
        signatures,
    } from "./constants";
    import { makeCombinedGeoJSON, getGeometryBounds } from "./utils";

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
    // Method to visualise scenario comparison
    let compareView: CompareView = "difference";
    // Initial opacity
    let opacity: number = 0.8;

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

    // Construct raw HTML for the hover popup. This is really ugly, but works
    // well enough for our small use case.
    function makeHoverHtml(feat: GeoJSON.Feature) {
        function makeSig(): string {
            const sig = signatures[feat.properties.sig].name;
            if (compareScenarioName === null) {
                return `<span class="oa-grid-item strong">${sig}</span>`;
            } else {
                const cmpSig = signatures[feat.properties["sig-cmp"]].name;
                if (sig === cmpSig) {
                    return `<span class="oa-grid-item strong">${sig}</span>`;
                } else {
                    return `<span class="oa-grid-item old-sig">${cmpSig}</span><span class="oa-grid-item strong">&nbsp;&nbsp;↳ ${sig}</span>`;
                }
            }
        }
        function makeIndi(indi: Indicator): string {
            const val = feat.properties[indi.name];
            let valString: string;
            if (compareScenarioName === null) {
                valString = val.toFixed(2);
            } else {
                const cmpVal = feat.properties[`${indi.name}-cmp`];
                const chg = cmpVal === 0 ? 0 : ((val - cmpVal) / cmpVal) * 100;
                valString = `${val.toFixed(2)} (${
                    chg >= 0 ? "+" : "−"
                }${Math.abs(chg).toFixed(1)}%)`;
            }
            return [
                `<span>${indi.short.replace(
                    "accessibility",
                    "access."
                )}</span>`,
                `<span class="right-align-grid-item ${
                    activeFactor === indi.name ? "strong" : ""
                }">`,
                valString,
                `</span>`,
            ].join("");
        }
        return [
            `<div class="hover-grid">`,
            `<span class="oa-grid-item oa-name">${feat.properties.OA11CD}</span>`,
            makeSig(),
            ...allIndicators.map(makeIndi),
            `</div>`,
        ].join("");
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

    // Setup functions. We have to use Svelte's 'onMount' because the code in
    // this script is run before the DOM is generated.
    onMount(() => {
        // Manually update the size of the containing div to be 100vw/100vh.
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
        // It doesn't matter which of the four indicator layers we add it to;
        // however, we have to choose one of them and *not* the line layer,
        // because the hover effect for the line layer only triggers when the
        // mouse is placed directly on a border.
        // Refer to https://maplibre.org/maplibre-gl-js-docs/example/hover-styles/
        map.on("mousemove", "air_quality-layer", function (e) {
            if (e.features.length > 0) {
                const feat = e.features[0];
                if (hoveredId !== null) {
                    map.setFeatureState(
                        { source: "newcastle", id: hoveredId },
                        { hover: false }
                    );
                }
                hoveredId = feat.id as number;
                map.setFeatureState(
                    { source: "newcastle", id: feat.id },
                    { hover: true }
                );
                if (hoverPopup !== null) {
                    hoverPopup.remove();
                }
                let bounds = getGeometryBounds(feat.geometry);
                hoverPopup = new maplibregl.Popup({
                    closeButton: false,
                    closeOnClick: false,
                    anchor: "bottom",
                    maxWidth: "none",
                })
                    .setLngLat([bounds.getCenter().lng, bounds.getNorth()])
                    .setHTML(makeHoverHtml(feat))
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
                const feat = e.features[0];
                if (clickedId !== null) {
                    map.setFeatureState(
                        { source: "newcastle", id: clickedId },
                        { click: false }
                    );
                }
                clickedId = feat.id as number;
                map.setFeatureState(
                    { source: "newcastle", id: feat.id },
                    { click: true }
                );
                // Centre map on that OA if the new div would obscure it.
                const oaBounds = getGeometryBounds(feat.geometry);
                if (oaInWindowEdge(oaBounds, map.getBounds())) {
                    map.flyTo({
                        center: oaBounds.getCenter(),
                        speed: 0.5,
                    });
                }
                // Generate popup
                if (clickPopup !== null) {
                    clickPopup.remove();
                }
                let bounds = getGeometryBounds(feat.geometry);
                clickPopup = new maplibregl.Popup({
                    closeButton: true,
                    closeOnClick: false,
                    anchor: "bottom",
                    maxWidth: "none",
                })
                    .setLngLat([bounds.getCenter().lng, bounds.getNorth()])
                    .setHTML(makeHoverHtml(feat))
                    .addTo(map);
                clickPopup.on("close", function () {
                    map.setFeatureState(
                        { source: "newcastle", id: clickedId },
                        { click: false }
                    );
                    clickedId = null;
                });
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
        map.addSource("newcastle", {
            type: "geojson",
            data: mapData,
            promoteId: "id",
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
        for (const factor of allFactors) {
            const layerName = `${factor.name}-layer`;
            map.addLayer({
                id: layerName,
                type: "fill",
                source: "newcastle",
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
        map.addLayer({
            id: "line-layer",
            type: "line",
            source: "newcastle",
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
                // @ts-ignore: Suppressing a known bug https://github.com/maplibre/maplibre-gl-js/issues/1708
                "line-opacity-transition": { duration: 300 },
            },
        });

        // Then, we fade the ones we want in, after a small delay to allow for loading.
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

    // Update underlying data. This should be called whenever the indicator
    // values are changed (i.e. when the scenarios are changed).
    function updateMapData(mapData: GeoJSON.FeatureCollection) {
        if (map) {
            (map.getSource("newcastle") as maplibregl.GeoJSONSource).setData(
                mapData
            );
            updateLayers();
            updateClickedFeature(mapData);
        }
    }

    // Update layer styles. This should be called whenever the user wants to
    // view different parts of the same data (e.g. when changing indicator, or
    // compareView).
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
    }

    function updateClickedFeature(mapData: GeoJSON.FeatureCollection) {
        if (clickedId !== null) {
            // Have to save it here because clickPopup.remove() will remove it
            const tmpClickedId = clickedId;
            // Remove popup
            if (clickPopup !== null) {
                clickPopup.remove();
            }
            // Regenerate popup
            clickedId = tmpClickedId;
            const feat = mapData.features.find((feat) => feat.id === clickedId);
            map.setFeatureState(
                { source: "newcastle", id: clickedId },
                { click: true }
            );
            console.log(clickedId);
            let bounds = getGeometryBounds(feat.geometry);
            clickPopup = new maplibregl.Popup({
                closeButton: true,
                closeOnClick: false,
                anchor: "bottom",
                maxWidth: "none",
            })
                .setLngLat([bounds.getCenter().lng, bounds.getNorth()])
                .setHTML(makeHoverHtml(feat))
                .addTo(map);
            clickPopup.on("close", function () {
                map.setFeatureState(
                    { source: "newcastle", id: clickedId },
                    { click: false }
                );
                clickedId = null;
            });
        }
    }

    /* Event handlers! */
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
