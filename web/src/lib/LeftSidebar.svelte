<script lang="ts">
    import Sidebar from "src/lib/Sidebar.svelte";
    import Tooltip from "src/lib/reusable/Tooltip.svelte";
    import showWelcomeIcon from "src/assets/show-welcome.svg";
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();
    import Choose from "src/lib/leftSidebar/Choose.svelte";
    import Create from "src/lib/leftSidebar/Create.svelte";
    import Import from "src/lib/leftSidebar/Import.svelte";
    import Welcome from "src/lib/leftSidebar/Welcome.svelte";
    import Tabs from "src/lib/leftSidebar/Tabs.svelte";

    import { scenarioName, compareScenarioName } from "src/stores";
    let welcomeVisible: boolean = !(
        localStorage.getItem("doNotShowWelcome") === "true"
    );

    let selectedTab: "choose" | "create" | "import" = "choose";

    // This function fires when a new scenario is successfully added, either
    // via Create (custom scenarios) or Import (file upload).
    function handleImportEvent(event: CustomEvent) {
        selectedTab = "choose";
        $scenarioName = event.detail.name;
        $compareScenarioName = null;
        dispatch("changeScenario");
    }
</script>

<Welcome bind:welcomeVisible />
<Sidebar>
    <div class="sidebar-contents">
        <h1 class="title">Tyne and Wear development scenario modelling</h1>

        <p>
            Explore a modelled impact of various development scenarios in Tyne
            and Wear on four indicators of quality of life.

            <Tooltip --width="max-content" --transformy="35px">
                <button
                    slot="content"
                    id="show-welcome"
                    on:click={() => (welcomeVisible = true)}
                    ><img
                        src={showWelcomeIcon}
                        alt="Show welcome screen again"
                    /></button
                >
                <span slot="description">Show welcome screen</span>
            </Tooltip>
        </p>

        <p>
            All indicator values are linearly scaled such that the baseline
            ranges from 0 to 100.
        </p>

        <div id="tabs-and-content">
            <Tabs bind:selectedTab />

            <div class="tab-content">
                {#if selectedTab === "choose"}
                    <Choose on:changeScenario />
                {:else if selectedTab === "create"}
                    <Create
                        on:changeScenario={() => {
                            $compareScenarioName = null;
                            dispatch("changeScenario");
                        }}
                        on:import={handleImportEvent}
                    />
                {:else if selectedTab === "import"}
                    <Import on:import={handleImportEvent} />
                {/if}
            </div>
        </div>
    </div>
</Sidebar>

<style>
    div.sidebar-contents {
        /* This controls the total width of the left sidebar. */
        width: 280px;
    }

    h1.title {
        margin-top: 0px !important;
    }

    button#show-welcome {
        background-color: transparent;
        border: none;
        cursor: pointer;
        padding: 0;
        height: 15px;
        width: 15px;
        transform: translateY(2px);
    }
    button#show-welcome:hover {
        background-color: #dddddd;
    }
    button#show-welcome > img {
        height: 100%;
        width: 100%;
    }

    div#tabs-and-content {
        margin-top: 20px;
    }
    div.tab-content {
        padding: 10px 10px 12px 10px;
        border: 1px solid #e6e6e6;
        border-radius: 0px 0px 6px 6px;
        background-color: #ffffff;
    }
</style>
