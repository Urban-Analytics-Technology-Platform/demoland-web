<script lang="ts">
    import { engineGithubUrl } from "../../constants";
    import JSZip from "jszip";

    function cancel() {
        const target = document.getElementById(
            "select-files"
        ) as HTMLInputElement;
        target.value = "";
    }

    function process() {
        const target = document.getElementById(
            "select-files"
        ) as HTMLInputElement;
        if (!target.files || target.files.length === 0) {
            return;
        }
        // Validation
        function validateZip(file: File) {
            JSZip.loadAsync(file).then((zip) => {
                let s = "";
                zip.forEach((relativePath, zipEntry) => {
                    s += relativePath + zipEntry + "\n";
                    zipEntry.async("string").then((data) => {
                        console.log(JSON.parse(data));
                    });
                });
                window.alert(s);
            });
        }
        for (const file of target.files) {
            validateZip(file);
        }
        // TODO: Visualisation
    }
</script>

<div id="import-contents">
    If you have already modelled a custom scenario and saved the results, you
    can import it here to visualise the results.

    <h3>Choose one or more .zip files...</h3>
    <div id="getfile-container">
        <input id="select-files" type="file" accept="*.zip" multiple />

        <button on:click={() => cancel()}>Cancel</button>
        <button on:click={() => process()}>Import</button>
    </div>

    <h3>Using the Python engine yourself</h3>

    Blah Blah. Look at<a href={engineGithubUrl} target="_blank">GitHub</a>.
</div>

<style>
    h3 {
        font-size: 100%;
        font-weight: bold;
    }

    div#getfile-container {
        margin-top: 15px;
    }
</style>
