<script lang="ts">
    import closeButtonUrl from "../assets/close-button.svg";
    import leftSidebarScreenshot from "../assets/left-sidebar.png";
    import rightSidebarScreenshot from "../assets/right-sidebar.png";

    // Whether to show the welcome screen when the page is loaded
    let doNotShowOnPageLoad: boolean =
        localStorage.getItem("doNotShowWelcome") === "true";

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
                <button
                    id="close-button"
                    on:click={() => {
                        welcomeVisible = false;
                    }}
                >
                    <img src={closeButtonUrl} alt="Close" />
                </button>
            </div>
        </div>
        <h2>
            Spatial modelling for land management predicting the impact of
            large-scale planning and land use changes on the quality of life.
        </h2>

        <p>
            This interactive app showcases the outcomes of the <i
                >Land Use Demonstrator</i
            >
            project, which seeks to develop a modelling system leveraging data science
            and AI to support decision-making in land use policy.
        </p>

        <p>
            In this project, competing aspects of land use in an urban
            environment are identified and quantified. We first do this for
            present-day Tyne and Wear (called the
            <i>baseline</i>), and then create specific <i>scenarios</i> where
            the distribution of land use is modified. These land use
            characteristics are then used to calculate four <i>indicators</i> which
            represent different aspects of quality of life.
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
            >.
        </p>

        <h2>How to use</h2>
        <p>
            The <b>map</b> shows the area of Tyne and Wear as it is seen through
            the data today and in the seven development scenarios on Census 2011
            Output Area geometries.
        </p>

        <div id="flex-navigation-help">
            <img src={leftSidebarScreenshot} alt="Screenshot of left sidebar" />
            <div>
                <p>
                    Use the <b>left navigation bar</b> to change the scenario or
                    switch to a comparison mode.
                </p>
                <p>
                    The changes in each scenario (relative to the baseline) are
                    contained within a specific area of Tyne and Wear. When a
                    scenario is selected, the modified area is outlined on the
                    map in black.
                </p>
            </div>
        </div>

        <div id="flex-navigation-help">
            <div>
                <p>
                    Use the <b>right navigation bar</b> to change what is displayed
                    on the map. You can choose between:
                </p>
                <ul>
                    <li>
                        <i>Land use</i>, as characterised by
                        <a href="https://urbangrammarai.xyz/story/"
                            >spatial signatures</a
                        >;
                    </li>
                </ul>
                or any of the four quality-of-life indicators:
                <ul>
                    <li>
                        <i>Air pollution</i>, a composite index based on PM2.5,
                        PM10, NO<sub>2</sub> and SO<sub>3</sub> particles;
                    </li>
                    <li>
                        <i>House prices</i>, an index based on real sale prices;
                    </li>
                    <li>
                        <i>Job accessibility</i>, reflecting the number of jobs
                        within 15 minutes;
                    </li>
                    <li>
                        <i>Greenspace accessibility</i>, reflecting the area of
                        formal parks within 15 minutes.
                    </li>
                </ul>
            </div>
            <img
                src={rightSidebarScreenshot}
                alt="Screenshot of right sidebar"
            />
        </div>
    </div>
{/if}

<style>
    button#background-cover-button {
        /* remove all styling */
        background: none;
        border: none;
        padding: 0;
        margin: 0;
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
    }

    div#welcome {
        width: 80%;
        height: min-content;
        max-height: 60%;
        overflow-y: scroll;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        padding: 25px;
        background-color: #ffffff;
        border-radius: 10px;
        box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
        z-index: 5;
        max-width: 800px;
        line-height: 1.4;
    }
    div#welcome > :first-child {
        margin-top: 0 !important;
    }
    div#welcome > :last-child {
        margin-bottom: 0 !important;
    }

    div#heading-and-close {
        display: flex;
        gap: 15px;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
    }

    div#heading-and-close > * {
        margin-top: 0px;
        margin-bottom: 0px;
    }

    div#close {
        display: flex;
        gap: 20px;
        align-items: center;
    }

    button#close-button {
        border: none;
        cursor: pointer;
        background-color: #ffffff;
        padding: 0;
        margin: 0;
        width: 20px;
        height: 20px;
        transform: translate3d(0, 0, 0);
    }
    button#close-button > img {
        width: 100%;
        height: 100%;
        transform: translate3d(0, 0, 0);
    }

    button#close-button:hover {
        background-color: #dddddd;
    }

    h2 {
        margin-top: 20px;
    }

    ul > li {
        margin-bottom: 10px;
    }

    div#flex-navigation-help {
        display: flex;
        gap: 20px;
        align-items: center;
        margin-top: 20px;
        margin-bottom: 20px;
    }

    div#flex-navigation-help > img {
        width: 250px;
    }
</style>
