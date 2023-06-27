<script lang="ts">
    // Must be imported here and used in the HTML rather than being placed in
    // the CSS itself, otherwise the file will be lost when building.
    import closeButtonUrl from "../assets/close-button.svg";

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
                    /><label for="doNotShowNextTime">Do not show on page load</label>
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
            This is an interactive app showcasing the outcome of a project
            developing a modelling system which is able to quantify several
            competing aspects of land use in a given urban environment as it
            currently exists (baseline) and build scenarios under changes that
            affect the distribution of such land use.
        </p>
        <p>
            The map shows the area of Tyne and Wear as it is seen through the
            data today and in the seven development scenarios on Census 2011
            Output Area geometries.
        </p>
        <h2>How to use?</h2>
        <ul>
            <li>
                Use the left navigation bar to change the scenario or switch to
                a comparison mode. Each scenario is limited to a specific area
                of Tyne and Wear highlighted in black when a scenario is
                selected.
            </li>
            <li>
                Use the right navigation bar to change the map. You can switch
                between land use and one of the four indicators of quality of
                life:
            </li>
            <ul>
                <li>
                    <i>Land use</i>, as characterised by
                    <a href="https://urbangrammarai.xyz/story/"
                        >spatial signatures</a
                    >.
                </li>
                <li>
                    <i>Air pollution</i>, as a composite index based on PM2.5,
                    PM10, NO2 and SO3 particles.
                </li>
                <li><i>House price index</i>, based on real sale prices.</li>
                <li>
                    <i>Job accessibility</i>, reflecting the number of jobs
                    within 15 minutes.
                </li>
                <li>
                    <i>Greenspace accessibility</i>, reflecting the area of
                    formal parks within 15 minutes.
                </li>
            </ul>
        </ul>

        <h2>About the project</h2>
        <p>
            The project is a partnership between the Geospatial Commission and
            The Alan Turing Institute, working with Newcastle City Council to
            develop a modelling system that leverages data science and AI to
            support decision-making in land use policy.
        </p>
        <p>
            <!-- TODO: the link should go to the Turing project page once that is live -->
            See more details at
            <a
                href="https://www.turing.ac.uk/research/research-programmes/urban-analytics"
                >the project page</a
            >.
        </p>
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

    ul > li {
        margin-bottom: 10px;
    }
</style>
