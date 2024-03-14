<script lang="ts">
  import { createEventDispatcher } from "svelte";

  export let thoughts;

  const dispatch = createEventDispatcher();
  function close() {
    console.log("closing");
    dispatch("close");
  }
</script>

<div>
  <div class="thoughts">
    {#each thoughts as thought}
      <ol>
        <li>{thought.action}</li>
      </ol>
    {/each}
  </div>
  <button on:click={close}>Close</button>
</div>

<style>
  .thoughts {
    max-height: 500px;
    overflow-y: auto;
  }
</style>
