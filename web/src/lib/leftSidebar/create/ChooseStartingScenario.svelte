<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import {
        allScenarios,
        scenarioName,
        compareScenarioName,
    } from "src/stores";
    import { copyScenario } from "src/utils/scenarios";
    const dispatch = createEventDispatcher();
    dispatch("changeScenario", {});
    import {
        InputFieldsContainer,
        HorizontalRule,
    } from "src/lib/leftSidebar/create/ui";

    function previewScenario(event: Event) {
        const buttons: NodeListOf<HTMLButtonElement> =
            document.querySelectorAll(".scenario-button");
        Array.from(buttons).forEach((button) => {
            if (button !== event.target) {
                button.style.backgroundColor = "#fff";
            }
        });
        let button = event.target as HTMLButtonElement;
        button.style.backgroundColor = "#eaeaea";
        $scenarioName = button.value;
        $compareScenarioName = null;
        dispatch("changeScenario");
    }

    function setScenarioAndProceed(event: Event) {
        let button = event.target as HTMLButtonElement;
        const customScenarioName = "custom_in_progress";
        $allScenarios.set(
            customScenarioName,
            copyScenario($allScenarios.get(button.value))
        );
        $scenarioName = customScenarioName;
        $compareScenarioName = null;
        dispatch("changeScenarioAndProceed");
    }
</script>

<InputFieldsContainer title={"Step 1: Choose starting scenario"}>
    <div class="smaller">
        Hover over a scenario to load the changes to the map. When you&rsquo;re
        ready, click on one to proceed: that will be used as the starting point
        for your own modifications.
    </div>
    <HorizontalRule />
    {#each [...$allScenarios.entries()] as [name, scenario]}
        <button
            class="scenario-button"
            value={name}
            on:click={setScenarioAndProceed}
            on:focus={previewScenario}
            on:mouseover={previewScenario}>{scenario.metadata.long}</button
        >
    {/each}
</InputFieldsContainer>

<style>
    div.smaller {
        font-size: 90%;
    }

    button {
        width: 100%;
        text-align: left;
        font-family: inherit;
        background-color: #fff;
        border: 1px solid #000000;
        border-radius: 5px;
        box-shadow: 0px 1px 0px rgba(0, 0, 0, 0.1);
        cursor: pointer;
        padding: 3px 5px;
    }

    button:hover {
        background-color: #f2f2f2;
        transition: background-color 0.1s ease-in-out;
    }

    button:active {
        background-color: #eaeaea;
        transition: none 0s;
    }
</style>
