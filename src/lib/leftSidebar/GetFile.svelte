<script lang="ts">
    export let filetype: string;
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();

    function cancel() {
        const target = document.getElementById(
            "file-selector"
        ) as HTMLInputElement;
        target.value = "";
    }

    function handleFile() {
        const target = document.getElementById(
            "file-selector"
        ) as HTMLInputElement;
        if (!target.files || target.files.length === 0) {
            return;
        }
        const file = target.files[0];
        const reader = new FileReader();
        reader.onload = (event: ProgressEvent<FileReader>) => {
            const contents = event.target.result as string;
            dispatch("fileLoaded", { contents: contents });
        };
        reader.readAsText(file);
    }
</script>

<input id="file-selector" type="file" accept={filetype} />
<button on:click={() => cancel()}>Cancel</button>
<button on:click={() => handleFile()}>Import</button>
