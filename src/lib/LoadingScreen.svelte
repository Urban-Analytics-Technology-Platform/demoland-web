<div id="loading">
    Loading...
    <div id="spinner" />
</div>

<style>
    div#loading {
        font-family: sans-serif;
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }

    div#spinner {
        border: 8px solid #eeeeee;
        border-top: 8px solid #32a852;
        border-radius: 50%;
        width: 60px;
        height: 60px;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }
</style>
