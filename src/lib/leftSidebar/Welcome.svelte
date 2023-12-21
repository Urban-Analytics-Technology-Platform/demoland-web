<script lang="ts">
    import leftSidebarScreenshot from "src/assets/left-sidebar.png";
    import rightSidebarScreenshot from "src/assets/right-sidebar.png";
    import mapScreenshot from "src/assets/map.png";
    import changesScreenshot from "src/assets/changes.png";
    import CloseButton from "src/lib/reusable/CloseButton.svelte";
    import { config } from "src/config";

    // Whether to show the welcome screen when the page is loaded
    let doNotShowOnPageLoad: boolean =
        localStorage.getItem("doNotShowWelcome") === "true";

    const bookUrl: string = "https://urban-analytics-technology-platform.github.io/demoland-project";

    // Whether the welcome screen is visible (initialised based on page load
    // setting, but can be toggled if the user wants to re-display it)
    export let welcomeVisible: boolean = !doNotShowOnPageLoad;

    // Store the value of the 'show next time' checkbox in local storage
    function storeCheckboxValue() {
        localStorage.setItem(
            "doNotShowWelcome",
            doNotShowOnPageLoad ? "true" : "false"
        );
    }
</script>

{#if welcomeVisible}
    <button
        id="background-cover-button"
        on:click={() => {
            welcomeVisible = false;
        }}
    >
        <div id="background-cover" />
    </button>

    <div id="welcome">
        <div id="heading-and-close">
            <h1>Land Use Demonstrator</h1>

            <div id="close">
                <span>
                    <input
                        type="checkbox"
                        id="doNotShowNextTime"
                        bind:checked={doNotShowOnPageLoad}
                        on:change={storeCheckboxValue}
                    /><label for="doNotShowNextTime"
                        >Do not show on page load</label
                    >
                </span>
                <CloseButton
                    --width="20px"
                    on:click={() => {
                        welcomeVisible = false;
                    }}
                />
            </div>
        </div>

        <div id="welcome-content">
            <h2>
                Spatial modelling for land management predicting the impact of
                large-scale planning and land use changes on the quality of
                life.
            </h2>

            <p>
                This interactive app showcases the outcomes of the <i
                    >Land Use Demonstrator</i
                >
                project, which seeks to develop a modelling system leveraging data
                science and AI to support decision-making in land use policy.
            </p>

            <p>
                In this project, competing aspects of land use in an urban
                environment are identified and quantified. We first do this for
                present-day {config.areaName} (called the
                <i>baseline</i>), and then create specific <i>scenarios</i>
                where the distribution of land use is modified. These land use characteristics
                are then used to calculate four
                <i>indicators</i> which represent different aspects of quality of
                life.
            </p>

            <p>
                The project is led by the
                <a
                    href="https://www.gov.uk/government/organisations/geospatial-commission"
                    target="_blank">Geospatial Commission</a
                >
                and
                <a href="https://www.turing.ac.uk/" target="_blank"
                    >The Alan Turing Institute</a
                >, working in conjunction with
                <a href="https://www.newcastle.gov.uk/" target="_blank"
                    >Newcastle City Council</a
                >. You can read more about the project in the associated
                <a href={bookUrl}>Land Use Demonstrator book</a>.
            </p>

            <h2 class="smaller-bottom-margin">How to use</h2>

            <div class="flex-navigation-help">
                <div class="flex-help">
                    <span>
                        The <b>map</b> shows the area of {config.areaName} as it
                        is seen through the data today (or in any other development
                        scenarios).
                    </span>
                    <span>
                        The county is subdivided into 3,795
                        <a
                            href="https://www.ons.gov.uk/peoplepopulationandcommunity/populationandmigration/populationestimates/bulletins/2011censuspopulationandhouseholdestimatesforsmallareasinenglandandwales/2012-11-23"
                            target="_blank"
                            >Output Area geometries from the 2011 UK Census</a
                        >. You can hover or click on each Output Area to see
                        specific details about it.
                    </span>
                </div>
                <img src={mapScreenshot} alt="Screenshot of map" />
            </div>

            <div class="flex-navigation-help">
                <img
                    src={leftSidebarScreenshot}
                    alt="Screenshot of left sidebar"
                />
                <div class="flex-help">
                    <span>
                        When in the <i>&lsquo;View scenarios&rsquo;</i> mode,
                        use the
                        <b>left navigation bar</b> to change the scenario or switch
                        to a comparison mode.
                    </span>
                    <span>
                        The changes in each scenario (relative to the baseline)
                        are contained within a specific area of {config.areaName}.
                        When a scenario is selected, this modified area is
                        outlined on the map in black:
                    </span>
                    <img
                        class="align-center"
                        src={changesScreenshot}
                        alt="Modified area outlined in black"
                        width="40%"
                    />
                    <span>
                        You can also use the other tabs to create your own
                        scenarios, or import scenarios from JSON files.
                    </span>
                </div>
            </div>

            <div class="flex-navigation-help">
                <div class="flex-help">
                    <span>
                        Use the <b>right navigation bar</b> to change what is displayed
                        on the map. You can choose between:
                    </span>
                    <ul>
                        <li>
                            <i>Land use</i>, as characterised by
                            <a href="https://urbangrammarai.xyz/story/"
                                >spatial signatures</a
                            >;
                        </li>
                    </ul>
                    <span>or any of the four quality-of-life indicators:</span>
                    <ul>
                        <li>
                            <i>Air pollution</i>, a composite index based on
                            PM2.5, PM10, NO<sub>2</sub> and SO<sub>3</sub> particles;
                        </li>
                        <li>
                            <i>House prices</i>, an index based on real sale
                            prices;
                        </li>
                        <li>
                            <i>Job accessibility</i>, reflecting the number of
                            jobs within 15 minutes;
                        </li>
                        <li>
                            <i>Greenspace accessibility</i>, reflecting the area
                            of formal parks within 15 minutes.
                        </li>
                    </ul>
                </div>
                <img
                    src={rightSidebarScreenshot}
                    alt="Screenshot of right sidebar"
                />
            </div>
        </div>
    </div>
{/if}

<style>
    button#background-cover-button {
        /* remove all styling and make sure it doesn't occupy any space (or
         * create a gap in the parent flexbox) */
        display: contents;
    }
    div#background-cover {
        width: 100vw;
        height: 100vh;
        position: absolute;
        top: 0;
        left: 0;
        background-color: #eee;
        opacity: 0.7;
        z-index: 4;
        cursor: pointer;
        pointer-events: auto;
    }

    div#welcome {
        width: 80%;
        height: 60%;
        max-height: 60%;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        padding: 25px 5px 25px 25px;
        background-color: #ffffff;
        border-radius: 10px;
        box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
        z-index: 5;
        max-width: 800px;
        line-height: 1.4;
        display: flex;
        flex-direction: column;
        gap: 5px;
        pointer-events: auto;
    }

    div#heading-and-close {
        display: flex;
        gap: 15px;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding-right: 20px;
    }

    div#heading-and-close > * {
        margin-top: 0px;
        margin-bottom: 0px;
    }

    div#welcome-content {
        height: 100%;
        overflow-y: scroll;
        padding-right: 20px;
    }
    div#welcome-content > :first-child {
        margin-top: 0 !important;
    }
    div#welcome-content > :last-child {
        margin-bottom: 0 !important;
    }

    div#close {
        display: flex;
        gap: 20px;
        align-items: center;
    }

    h2 {
        margin-top: 30px;
    }

    ul > li {
        margin-bottom: 10px;
    }
    ul > li:last-child {
        margin-bottom: 0px;
    }

    div.flex-navigation-help {
        display: flex;
        gap: 40px;
        align-items: center;
        margin-bottom: 30px;
    }

    div.flex-navigation-help > img {
        width: 250px;
    }

    div.flex-help {
        display: flex;
        flex-direction: column;
        align-items: start;
        gap: 15px;
    }

    div.flex-help > img.align-center {
        margin: 0 auto;
    }

    div.flex-help > ul {
        margin-top: 0px;
        margin-bottom: 0px;
    }
</style>
