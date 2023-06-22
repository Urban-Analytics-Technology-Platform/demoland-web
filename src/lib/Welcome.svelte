<script lang="ts">
    export let welcomeVisible: boolean;
    let doNotShowChecked: boolean;
    // Must be imported here and used in the HTML rather than being placed in
    // the CSS itself, otherwise the file will be lost when building.
    import closeButtonUrl from "../assets/close-button.svg";

    function hideWelcome() {
        if (doNotShowChecked) {
            localStorage.setItem("doNotShowWelcome", "true");
        }
        welcomeVisible = false;
    }
</script>

{#if welcomeVisible}
    <div id="cover" />
    <div id="welcome">
        <div id="heading-and-close">
            <h1>Welcome</h1>

            <div id="close">
                <span>
                    <input
                        type="checkbox"
                        id="doNotShowNextTime"
                        bind:checked={doNotShowChecked}
                    /><label for="doNotShowNextTime">Do not show again</label>
                </span>
                <button
                    id="close-button"
                    on:click={hideWelcome}
                    style="background-image: url('{closeButtonUrl}');"
                />
            </div>
        </div>

        <p>
            OBI-WAN: I have failed you, Anakin. I was never able to teach you to
            think.
        </p>
        <p>ANAKIN and OBI-WAN confront each other on the lava river.</p>
        <p>
            ANAKIN: I should have known the Jedi were plotting to take over . .
            .
        </p>
        <p>OBI-WAN: From the Sith!!! Anakin, Chancellor Palpatine is evil.</p>
        <p>
            ANAKIN: From the Jedi point of view! From my point of view, the Jedi
            are evil.
        </p>
        <p>OBI-WAN: Well, then you are lost!</p>
        <p>
            ANAKIN: This is the end for you, My Master. I wish it were
            otherwise.
        </p>
        <p>
            ANAKIN jumps and flips onto OBI-WAN's platform. The fighting
            continues again until OBI-WAN jumps toward the safety of the black
            sandy edge of the lava river. He yells at Anakin.
        </p>
        <p>OBI-WAN: It's over, Anakin. I have the high ground.</p>
        <p>ANAKIN: You underestimate my power!</p>
        <p>OBI-WAN: Don't try it.</p>
        <p>
            ANAKIN follows, and OBI-WAN cuts his young apprentice at the knees,
            then cuts off his left arm in the blink of an eye. ANAKIN tumbles
            down the embankment and rolls to a stop near the edge of the lava.
        </p>
        <p>
            ANAKIN struggles to pull himself up the embankment with his
            mechanical hand. His thin leather glove has been burned off. He
            keeps sliding down in the black sand.
        </p>
        <p>
            OBI-WAN: (continuing) . . . You were the Chosen One! It was said
            that you would, destroy the Sith, not join them. It was you who
            would bring balance to the Force, not leave it in Darkness.
        </p>
        <p>
            OBI-WAN picks up Anakin's light saber and begins to walk away. He
            stops and looks back.
        </p>
        <p>ANAKIN: I hate you!</p>
        <p>OBI-WAN: You were my brother, Anakin. I loved you.</p>
    </div>
{/if}

<style>
    div#cover {
        width: 100vw;
        height: 100vh;
        position: absolute;
        top: 0;
        left: 0;
        background-color: #eee;
        opacity: 0.7;
        z-index: 4;
    }

    div#welcome {
        width: 80%;
        height: 60%;
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
        align-items: baseline;
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
        width: 23px;
        height: 23px;
        background-color: #ffffff;
        background-repeat: no-repeat;
        background-size: cover;
        border: none;
        cursor: pointer;
    }

    button#close-button:hover {
        background-color: #dddddd;
    }
</style>
