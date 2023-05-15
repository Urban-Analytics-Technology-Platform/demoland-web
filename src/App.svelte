<script lang="ts">
  import Map from './lib/Map.svelte'
  import Sidebar from './lib/Sidebar.svelte'
</script>

<main>
  <Sidebar />
  <Map />
</main>

<style>
main {
    height: 100vh;
    width: 100vw;
    max-width: 100%;
    max-height: 100%;
    background-color: #80d195;   /* green */
}
</style>
