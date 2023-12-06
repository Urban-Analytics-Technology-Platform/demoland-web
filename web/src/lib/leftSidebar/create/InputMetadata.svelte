<script lang="ts">
    export let scenarioShort: string = "";
    export let scenarioDescription: string = "";
    export let calculationMethod: "azure" | "wasm" | "local" = "azure";
    import { config } from "src/data/config";
    import InputFieldsContainer from "./InputFieldsContainer.svelte";
    import BackForwardButtons from "./BackForwardButtons.svelte";
    import HorizontalRule from "./HorizontalRule.svelte";

    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();

    let scenarioShortInput: HTMLInputElement;
    let scenarioDescriptionInput: HTMLTextAreaElement;

    function showInRed(node: HTMLElement) {
        node.style.borderColor = "#f26d88";
    }

    // Check if the app is deployed on the server
    const deployed = window.location.href
        .toLowerCase()
        .includes(config.baseUrl.toLowerCase());
</script>

<InputFieldsContainer title={"Step 3: Input scenario metadata"}>
    <BackForwardButtons
        backText="Back to OA modification"
        forwardText="Accept changes and calculate"
        on:backClick={() => dispatch("returnToModify")}
        on:forwardClick={() => {
            if (scenarioShort === "") {
                alert("Please enter a scenario title.");
                showInRed(scenarioShortInput);
                return;
            }
            if (scenarioDescription === "") {
                alert("Please enter a scenario description.");
                showInRed(scenarioDescriptionInput);
                return;
            }
            dispatch("acceptChangesAndCalculate");
        }}
    />

    <HorizontalRule />

    <div id="calculation-method-choice">
        <i>Calculation method</i>
        <select bind:value={calculationMethod}>
            <option value="azure">Azure REST API</option>
            {#if !deployed}
                <option value="local">Local REST API</option>
            {/if}
            <option value="wasm">In-browser</option>
        </select>
    </div>
    <div class="smaller">
        {#if calculationMethod === "azure"}
            This is an <a
                href="https://learn.microsoft.com/en-us/azure/azure-functions/functions-overview"
                target="_blank">Azure Functions</a
            > instance, i.e. a web service hosted on the cloud.
        {:else if calculationMethod === "local"}
            To use this option, the API must be running on port 5174. This
            should be used only for development purposes.
        {:else if calculationMethod === "wasm"}
            This uses the <a
                href="https://pyodide.org/en/stable/"
                target="_blank">Pyodide library</a
            > to run the calculation entirely in your browser.
        {/if}
    </div>

    <HorizontalRule />

    <input
        type="text"
        bind:this={scenarioShortInput}
        bind:value={scenarioShort}
        placeholder="Scenario title..."
        on:input={() => {
            scenarioShortInput.style.borderColor =
                scenarioShort === "" ? "#f26d88" : "#999";
        }}
    />
    <textarea
        bind:this={scenarioDescriptionInput}
        bind:value={scenarioDescription}
        placeholder="A longer textual description..."
        spellcheck="false"
        on:input={() => {
            scenarioDescriptionInput.style.borderColor =
                scenarioDescription === "" ? "#f26d88" : "#999";
        }}
    />
</InputFieldsContainer>

<style>
    div#calculation-method-choice {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: baseline;
    }
    div.smaller {
        font-size: 85%;
    }
    input, textarea {
        border: 1.5px solid #999;
        border-radius: 3px;
        padding: 3px;
    }
    textarea {
        font-family: inherit;
        font-size: 90%;
    }
</style>
