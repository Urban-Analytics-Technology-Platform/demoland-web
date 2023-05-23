<script lang="ts">
    import { type ScenarioName, allScenarios } from "../constants";
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();

    export let currentScenarioName: ScenarioName;
    function changeScenario(_: Event) {
        dispatch("changeScenario", {
            scenarioName: currentScenarioName,
        });
    }

    $: currentScenario = allScenarios.find(s => s.name === currentScenarioName);
</script>

<div id="sidebar">
    <h1>Land Use Demonstrator</h1>

    <p>
        “In vain have I struggled. It will not do. My feelings will not be
        repressed. You must allow me to tell you how ardently I admire and love
        you.”
    </p>
    <p>
        Choose a scenario:
        <select id="scenario" bind:value={currentScenarioName} on:change={changeScenario}>
            {#each allScenarios as scenario}
                <option value={scenario.name}>{scenario.short}</option>
            {/each}
        </select>
    </p>
    <p>
        <b>{currentScenario.short}:</b> {currentScenario.description[0]}
    </p>
    {#each currentScenario.description.slice(1) as para}
        <p>{para}</p>
    {/each}
</div>

<style>
    div#sidebar {
        border-radius: 10px;
        opacity: 90%;
        box-sizing: border-box;
        width: 280px;
        min-width: 280px;
        padding: 20px;
        background-color: #deb4f0; /* purple */
        border: 1px solid black;

        margin-left: 0px;
        margin-right: auto;
        pointer-events: auto;
    }
    div#sidebar > :first-child {
        margin-top: 0 !important;
    }
    div#sidebar > :last-child {
        margin-bottom: 0 !important;
    }
</style>
