<script lang="ts">
    import GetFile from "./GetFile.svelte";
    import { engineGithubUrl } from "../../constants";

    function processScenario(event: CustomEvent) {
        window.alert(
            "Loaded into 'import scenario':\n\n" + event.detail.contents
        );
        // TODO: Validation
        // TODO: Modelling
        // TODO: Visualisation
    }

    function processResults(event: CustomEvent) {
        window.alert(
            "Loaded into 'import results':\n\n" + event.detail.contents
        );
        // TODO: Validation
        // TODO: Visualisation
    }
</script>

Coming soon to a web app near you...

<h3>Import scenario</h3>

<p>
    If you previously created a scenario file (<span class="ms"
        >[name].scenario</span
    >), you can import it here. The app will automatically carry out the
    modelling.
</p>

<GetFile filetype=".scenario" on:fileLoaded={processScenario} />

<h3>Import results</h3>

<p>
    If you have already modelled a custom scenario and saved the results (<span
        class="ms">[name].scenario.zip</span
    >), you can import it here to visualise the results.
</p>

<GetFile filetype=".scenario.zip" on:fileLoaded={processResults} />

<h3>Using the Python engine yourself</h3>

Blah Blah. Look at<a href={engineGithubUrl} target="_blank">GitHub</a>.

<style>
    h3 {
        font-size: 100%;
        font-weight: bold;
    }
</style>
