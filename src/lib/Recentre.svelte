<script lang="ts">
    export let initialCentre: maplibregl.LngLatLike;
    export let initialZoom: number;

    import { map } from "../stores";

    function recentre() {
        $map.flyTo({
            center: initialCentre,
            zoom: initialZoom,
            speed: 1.5,
        });
    }
</script>

<div id="recentre">
    <input type="button" value="Centre map" id="recentre" on:click={recentre} />
</div>

<style>
    input#recentre {
        position: absolute;
        top: 40px;
        left: 50%;
        transform: translateX(-50%);

        font-size: 14px;
        text-decoration: underline;

        border-radius: 10px;
        opacity: 90%;
        box-sizing: border-box;
        padding: 5px;
        background-color: #e8e8e8; /* grey */
        z-index: 1;
    }
</style>
