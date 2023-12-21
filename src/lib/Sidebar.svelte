<script lang="ts">
    import "overlayscrollbars/overlayscrollbars.css";
    import { overlayScrollbars } from "src/utils";
</script>

<div use:overlayScrollbars class="sidebar data-overlayscrollbars-initialize">
    <slot />
</div>

<style>
    div.sidebar {
        border-radius: 10px;
        box-sizing: border-box;
        min-width: min-content;
        width: min-content;
        padding: 20px;
        background-color: rgba(255, 255, 255, 0.9);
        box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
        min-height: min-content;
        max-height: calc(100vh - 40px);
        pointer-events: auto;
        z-index: 2;
    }
</style>
