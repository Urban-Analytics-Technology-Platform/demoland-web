<script lang="ts">
    import {
        TerraDraw,
        TerraDrawMapLibreGLAdapter,
        TerraDrawPolygonMode,
        TerraDrawFreehandMode,
    } from "terra-draw";
    import { onMount, onDestroy } from "svelte";
    import maplibregl from "maplibre-gl";
    import "maplibre-gl/dist/maplibre-gl.css";
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();
    
    export let mode: "polygon" | "freehand" = "polygon";

    export let map: maplibregl.Map;
    let draw: TerraDraw;

    // Start drawing
    onMount(() => {
        console.log("starting terradraw");

        const tdMode = mode === "polygon" ? new TerraDrawPolygonMode() : new TerraDrawFreehandMode();
        draw = new TerraDraw({
            adapter: new TerraDrawMapLibreGLAdapter({
                // @ts-ignore Not sure why this doesn't satisfy TS checks but it
                // works
                lib: maplibregl,
                // @ts-ignore same as above
                map: map,
                coordinatePrecision: 9,
            }),
            modes: [tdMode],
        });
        draw.start();
        draw.setMode(mode);

        // When polygon is finished, send it back upwards
        draw.on("finish", (finishedId: string) => {
            console.log(draw.getSnapshot());
            const feature = JSON.parse(
                JSON.stringify(
                    draw.getSnapshot().find((f) => f.id === finishedId)
                )
            );
            dispatch("finish", { feature });
        });
    });

    onDestroy(() => {
        console.log("ending terradraw");
        if (draw) {
            // Reset cursor pointer
            map.getCanvas().style.removeProperty("cursor");
            // Unsure why this is needed. TODO: Make an MWE and file an issue
            cancelAnimationFrame(draw._adapter.mapboxglAdapter._nextRender);
            draw.clear();
            draw.stop();
        }
    });
</script>
