<script lang="ts">
    import "maplibre-gl/dist/maplibre-gl.css";
    import maplibregl from "maplibre-gl";
    import config from "src/data/config";
    import {
        makeCombinedGeoJSON,
        getGeometryBounds,
        getInputDiffBoundaries,
    } from "src/utils/geojson";
    import { makePopup } from "src/utils/hover";
    import { allLayers, type LayerName } from "src/constants";
    import {
        allScenarios,
        scenarioName,
        compareScenarioName,
        scaleFactors,
        customScenarioInProgress,
        clickedOAs,
    } from "src/stores";
    import { onMount, onDestroy } from "svelte";

    /* --- PROPS ---------------------------------------------------------- */
    // The currently active map layer. Passed from the parent component.
    export let activeLayer: LayerName;
    // Initial opacity of the map layer. Passed from the parent component.
    export let opacity: number;
    // Whether the re-centre button needs to be shown. Calculated later.
    export let offcentre: boolean;

    /* --- OTHER STATE VARIABLES ------------------------------------------ */
    // The source id for the OA data. This can be any value, it's not important.
    const SOURCE_ID = "geojson_source";
    // The numeric ID of the OA being hovered over.
    let hoveredId: number | null = null;
    // The popup shown when hovering over an OA
    let hoverPopup: maplibregl.Popup | null = null;
    // The IDs of the OA(s) which were clicked on. Empty if no OA was clicked
    // on. Generally, this is a single OA, but can be multiple OAs during
    // custom scenario creation.
    let clickedId: number[] = [];
    // The popup shown when clicking on an OA
    let clickPopup: maplibregl.Popup | null = null;
    // The map object
    let map: maplibregl.Map;
    // The data to be plotted on the map. This variable is only initialised
    // after the map DOM is created, because it depends on the app
    // initialisation code.
    let mapData: GeoJSON.FeatureCollection = undefined;

    /* --- INITIALISATION ------------------------------------------------- */
    onMount(() => {
        console.log("MapC::onMount starting");

        // Generate data for map
        mapData = makeCombinedGeoJSON(
            $allScenarios.get($scenarioName),
            $compareScenarioName === null
                ? null
                : $allScenarios.get($compareScenarioName)
        );

        // Create map
        map = new maplibregl.Map({
            container: "map",
            style: "https://api.maptiler.com/maps/uk-openzoomstack-light/style.json?key=g6kCkRKHQMJqJMcThytt",
            center: [config.initialLongitude, config.initialLatitude],
            zoom: config.initialZoom,
            hash: true,
        });

        // Add in sources and create layers
        map.on("load", function () {
            drawLayers(mapData);
        });

        // Hover functionality across the area of interest.
        // TODO60 Layer name is hardcoded
        map.on("mousemove", "air_quality-layer", function (e) {
            if (e.features.length > 0) {
                const feat = e.features[0];
                if (feat.id !== hoveredId) {
                    disableHover();
                    if (!clickedId.includes(feat.id as number))
                        enableHover(feat);
                }
            }
        });

        // TODO60 Layer name is hardcoded
        map.on("mouseleave", "air_quality-layer", disableHover);

        // Click functionality across the entire map. In practice, because of
        // the defaultPrevented check, this function is only used to catch
        // clicks _outside_ the area of interest.
        map.on("click", function (e) {
            if (!e.defaultPrevented) {
                if (clickPopup !== null) {
                    clickPopup.remove();
                }
            }
        });

        // Click functionality within the area of interest.
        // TODO60 Layer name is hardcoded
        // TODO check e.originalEvent.shiftKey
        map.on("click", "air_quality-layer", function (e) {
            e.preventDefault();
            if (e.features.length > 0) {
                // Clicked on an OA
                const feat = e.features[0];
                if (clickPopup !== null) {
                    clickPopup.remove();
                }
                clickedId = [feat.id as number];
                enableClick(feat);
                // Centre map on that OA if the new div would obscure it.
                const oaBounds = getGeometryBounds(feat.geometry);
                if (oaInWindowEdge(oaBounds, map.getBounds())) {
                    map.flyTo({
                        center: oaBounds.getCenter(),
                        speed: 0.5,
                    });
                }
            }
        });

        // Detect whether the map is off-centre. This determines whether the
        // 're-centre' button is shown or not.
        offcentre = isOffcentre(); // For initial load
        map.on("move", function () {
            offcentre = isOffcentre();
        });

        // For unknown reasons, the map doesn't show until the window is resized.
        resizeContainer();

        console.log("MapC::onMount finished");
        // End onMount
    });

    // Not strictly needed but helps with HMR
    onDestroy(() => {
        console.log("MapC::onDestroy");
        if (map) {
            map.remove();
        }
    });

    /* --- HELPERS -------------------------------------------------------- */
    // Set div#map to have 100vw and 100vh height
    export function resizeContainer() {
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

    // Determine whether map is offcentre-enough to require the 're-centre'
    // button
    function isOffcentre() {
        const bounds = map.getBounds();
        return (
            map.getPitch() !== 0 ||
            map.getBearing() !== 0 ||
            map.getZoom() < 6 ||
            bounds.getWest() > -1.35 ||
            bounds.getEast() < -1.855 ||
            bounds.getNorth() < 54.8 ||
            bounds.getSouth() > 55.08
        );
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
        // 295 = padding of other-content-container + width of right-container
        return x < 340 || x > window.innerWidth - 295;
    }

    // Callback to be run when a click popup is closed (either via the close
    // button, or when the user clicks somewhere else on the map). Note: this
    // does not remove a popup. It is to be called when the popup is removed.
    function clickPopupCleanup() {
        if (clickedId.length > 0) {
            clickedId.forEach((id) => {
                map.setFeatureState(
                    { source: SOURCE_ID, id: id },
                    { click: false }
                );
            });
            clickedId = [];
        }
    }

    // Disable the currently active hover state, and remove the popup.
    function disableHover() {
        if (hoveredId !== null) {
            map.setFeatureState(
                { source: SOURCE_ID, id: hoveredId },
                { hover: false }
            );
            hoveredId = null;
        }
        if (hoverPopup !== null) {
            hoverPopup.remove();
        }
    }

    // Activate hover state on the map for the feature with the given numeric
    // ID, and generate a popup.
    function enableHover(feat: GeoJSON.Feature) {
        map.setFeatureState(
            { source: SOURCE_ID, id: feat.id as number },
            { hover: true }
        );
        hoverPopup = makePopup(
            map,
            feat,
            $compareScenarioName,
            activeLayer,
            false,
            $scaleFactors
        );
        hoveredId = feat.id as number;
    }

    // Activate click state on the map for the feature with the given numeric
    // ID. Note: this does not generate a popup.
    function enableClick(feat: GeoJSON.Feature) {
        map.setFeatureState(
            { source: SOURCE_ID, id: feat.id as number },
            { click: true }
        );
        clickPopup = makePopup(
            map,
            feat,
            $compareScenarioName,
            activeLayer,
            true,
            $scaleFactors
        );
        clickPopup.on("close", clickPopupCleanup);
    }

    // Draw the map layers. This should only be called when the map is
    // initialised. After it's been set up, we don't need to redraw the layers,
    // we just update the underlying data or styles.
    function drawLayers(mapData: GeoJSON.GeoJsonObject) {
        map.addSource(SOURCE_ID, {
            type: "geojson",
            data: mapData,
            // need to give the features numeric IDs for the click/hover to work
            promoteId: "id",
        });

        // Generate all polygon layers with an initial opacity of 0.01.
        //
        // The choice to use five different layers here seems to be suboptimal
        // at first glance. Indeed, virtually all the same functionality can be
        // accomplished by using only one layer, and toggling fill-color when
        // the active indicator is changed. However, fill-color is a
        // data-driven property, and these do not work with transitions: see
        // https://github.com/mapbox/mapbox-gl-js/issues/3170. (MapLibre, as a
        // fork of Mapbox, inherits this issue.) So, changing the fill-color
        // leads to a 'flickering' effect when the active indicator is changed.
        // The way around it is to use fill-opacity (which is not data-driven)
        // for four different layers. The only real drawback is (in principle)
        // performance, but I haven't really noticed any issues so far.
        for (const layerName of allLayers.keys()) {
            const mapLayerId = `${layerName}-layer`;
            map.addLayer({
                id: mapLayerId,
                type: "fill",
                source: SOURCE_ID,
                layout: {},
                paint: {
                    "fill-color": [
                        "get",
                        $compareScenarioName === null
                            ? `${layerName}-color`
                            : `${layerName}-diff-color`,
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
            source: SOURCE_ID,
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
        const diffedBoundaries = getInputDiffBoundaries(
            $allScenarios.get($scenarioName),
            $compareScenarioName === null
                ? null
                : $allScenarios.get($compareScenarioName)
        );
        map.addSource("boundary", {
            type: "geojson",
            data: diffedBoundaries,
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
            for (const layerName of allLayers.keys()) {
                const mapLayerId = `${layerName}-layer`;
                map.setPaintProperty(
                    mapLayerId,
                    "fill-opacity",
                    layerName === activeLayer ? opacity : 0.01 * opacity
                );
            }
            map.setPaintProperty("line-layer", "line-opacity", opacity);
        }, 200);
    }

    // Update the underlying data plotted by the map layers. This should be
    // called whenever the indicator values are changed (i.e. when the
    // scenario or comparison scenario are changed).
    function updateData(mapData: GeoJSON.FeatureCollection) {
        if (map) {
            (map.getSource(SOURCE_ID) as maplibregl.GeoJSONSource).setData(
                mapData
            );
            updateLayers();
        }
    }

    // Update layer styles. This is quite a general function --- it updates the
    // fill colours and opacity again according to the underlying data as well
    // as the opacity slider.
    export function updateLayers() {
        if (map) {
            for (const layerName of allLayers.keys()) {
                map.setPaintProperty(`${layerName}-layer`, "fill-color", [
                    "get",
                    $compareScenarioName === null
                        ? `${layerName}-color`
                        : `${layerName}-diff-color`,
                ]);
                map.setPaintProperty(
                    `${layerName}-layer`,
                    "fill-opacity",
                    layerName === activeLayer ? opacity : 0.01 * opacity
                );
            }
            map.setPaintProperty("line-layer", "line-opacity", opacity);
        }
        // Update the LineString layer
        const diffedBoundaries = getInputDiffBoundaries(
            $allScenarios.get($scenarioName),
            $compareScenarioName === null
                ? null
                : $allScenarios.get($compareScenarioName)
        );
        const boundarySource = map.getSource(
            "boundary"
        ) as maplibregl.GeoJSONSource;
        boundarySource.setData(diffedBoundaries);
        // Update the hover
        refreshClickedFeature(mapData);
    }

    // Refresh the click popup whenever the underlying data is changed. This is
    // necessary because the click popup contains indicator values etc.
    function refreshClickedFeature(mapData: GeoJSON.FeatureCollection) {
        if (clickedId.length > 0) {
            // Have to save it here because clickPopup.remove() will remove it
            const tmpClickedId = clickedId;
            // Remove popup
            if (clickPopup !== null) {
                clickPopup.remove();
            }
            // Regenerate popup
            clickedId = tmpClickedId;
            const feat = mapData.features.find((feat) =>
                clickedId.includes(feat.id as number)
            );
            enableClick(feat);
        }
    }

    // Get the name of the OA that was clicked on (for creating custom scenarios)
    function getOAName(featureId: number | null): string | null {
        if (featureId === null) {
            return null;
        }
        const feat = mapData.features.find((feat) => feat.id === featureId);
        return feat.properties[config.featureIdentifier];
    }

    // Redraw layers when scenario or compareScenario is changed
    export function updateScenario() {
        mapData = makeCombinedGeoJSON(
            $allScenarios.get($scenarioName),
            $compareScenarioName === null
                ? null
                : $allScenarios.get($compareScenarioName)
        );
        updateData(mapData);
    }

    // Recentre map when button is clicked
    export function recentre() {
        if (map) {
            map.flyTo({
                center: [config.initialLongitude, config.initialLatitude],
                zoom: config.initialZoom,
                speed: 1.5,
                bearing: 0,
                pitch: 0,
            });
        }
    }

    // Disable boxZoom when user is setting up a custom scenario. This allows
    // the map to register shift-click events.
    function toggleBoxZoom(customScenarioInProgress: boolean) {
        if (map) {
            customScenarioInProgress
                ? map.boxZoom.disable()
                : map.boxZoom.enable();
        }
    }

    $: {
        toggleBoxZoom($customScenarioInProgress);
        $clickedOAs = clickedId.map((id) => ({
            id: id,
            name: getOAName(id),
        }));
    }
</script>

<div id="map" />
