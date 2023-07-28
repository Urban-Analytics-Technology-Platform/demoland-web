<script type="ts">
/scrip

<button
    class="controls"
    on:click={decreaseScenario}
    disabled={!decreaseScenarioOk}
>
    <img
        class="control-arrows"
        src={decreaseScenarioOk ? leftIcon : leftIconDisabled}
        alt="Decrease scenario"
    />
</button>
<select id="scenario" bind:value={scenarioName} on:change={changeScenario}>
    {#each [...allScenarios.entries()] as [name, scenario]}
        <option value={name}>{scenario.short}</option>
    {/each}
</select>
<button
    class="controls"
    on:click={increaseScenario}
    disabled={!increaseScenarioOk}
>
    <img
        class="control-arrows"
        src={increaseScenarioOk ? rightIcon : rightIconDisabled}
        alt="Increase scenario"
    />
</button>

<!-- This wrapper container is used to make the fly transition work without a 'jumping' effect'. See https://stackoverflow.com/questions/59882179 -->
<div id="scenario-description-container">
    {#key scenarioName}
        <div
            id="scenario-description"
            in:customFlyIn
            out:customFlyOut
            on:outrostart={setMaxHeightToZero}
        >
            <h3 id="scenario-title">{scenario.long}</h3>
            <p>
                <!-- eslint-disable-next-line -->
                {@html scenario.description[0]}
            </p>
            {#each scenario.description.slice(1) as para}
                <!-- eslint-disable-next-line -->
                <p>{@html para}</p>
            {/each}
        </div>
    {/key}
</div>
