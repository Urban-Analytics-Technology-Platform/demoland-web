<script lang="ts">
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();

    const githubIssueUrl: string =
        "https://github.com/Urban-Analytics-Technology-Platform/demoland-web/issues";

    export let message: string;

    function close() {
        dispatch("close");
    }
</script>

<div id="error-cover">
    <div id="error">
        <h3>An error occurred :(</h3>

        <p id="error-message">{message}</p>

        <p>
            Please try again, or <a href={githubIssueUrl}
                >contact the developers</a
            > if the problem persists.
        </p>

        <p><button id="error-close" on:click={close}>Close</button></p>
    </div>
</div>

<style>
    div#error-cover {
        width: 100vw;
        height: 100vh;
        position: fixed;
        top: 0;
        left: 0;
        background-color: rgba(239, 239, 239, 0.7);
    }

    div#error {
        position: absolute;
        max-width: min(90vw, 350px);
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        padding: 10px 15px;
        background-color: #ffe8ea;
        border-radius: 10px;
        box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
    }

    div#error :first-child {
        margin-top: 0 !important;
    }

    div#error :last-child {
        margin-bottom: 0 !important;
    }

    p#error-message {
        font-size: 95%;
        padding: 0px 10px;
    }

    button#error-close {
        font-family: inherit;
        width: 100%;
    }
</style>
