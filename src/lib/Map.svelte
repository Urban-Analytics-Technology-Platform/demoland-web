<script lang="ts">
    import "maplibre-gl/dist/maplibre-gl.css";
    import maplibregl from 'maplibre-gl';
    import { onMount, onDestroy } from 'svelte';

    let map : maplibregl.Map;
    
    // Muse use onMount because this script is run before the DOM is generated.
    onMount(() => {
        map = new maplibregl.Map({
            container: 'map',
            style: 'https://api.maptiler.com/maps/uk-openzoomstack-road/style.json?key=g6kCkRKHQMJqJMcThytt',
            center: [-1.70, 54.98],
            zoom: 10.5
        });
        map.resize();
    });

    onDestroy(() => {
        map.remove();
    });
</script>


<div id="map">
</div>


<style>
div#map {
    width: 100vw;
    height: 100vh;
}
</style>
