<script lang="ts">
    export let filetype: string;
    export let inputId: string;
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();

    function cancel() {
        const target = document.getElementById(inputId) as HTMLInputElement;
        target.value = "";
    }

    function handleFile() {
        const target = document.getElementById(inputId) as HTMLInputElement;
        if (!target.files || target.files.length === 0) {
            return;
        }
        dispatch("fileLoaded", { contents: target.files[0] });
    }
</script>

<input id={inputId} type="file" accept={filetype} />
<button on:click={() => cancel()}>Cancel</button>
<button on:click={() => handleFile()}>Import</button>
