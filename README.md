# Land Use Demonstrator Web App

Web app for visualisation of modelling and results from the Land Use Demonstrator project. See:

- [The Geospatial Commission's blog post](https://www.landusedialogues.gov.uk/2023/03/13/using-spatial-data-science-to-deliver-more-from-the-same-land/) about the project
- [A page on the Alan Turing Institute's intranet, Mathison](https://mathison.turing.ac.uk/page/2864), about the project.

The frontend (Svelte/TypeScript) is in the `web` directory; the backend (Python) is in the [`demoland_engine` submodule](https://github.com/martinfleis/demoland_engine).


## View online

**https://alan-turing-institute.github.io/demoland-web**

The `dev` branch can be previewed at https://alan-turing-institute.github.io/demoland-web/dev.
(This is not guaranteed to always be functional!)


## Running locally

The easiest way is probably using Docker.
Make sure to include the `--recursive` flag when cloning; this ensures that the backend submodule is properly initialised.

```
git clone --recursive git@github.com:alan-turing-institute/demoland-web.git
cd demoland-web
make docker
```

Then, navigate to http://localhost:5173.


## Local development

First, clone the repository as before:

```
git clone --recursive git@github.com:alan-turing-institute/demoland-web.git
cd demoland-web
```

For the frontend:

```
make fe-deps   # First time only
make fe
```

Vite (the build tool this app uses) defaults to port 5173, so the web app is again accessible via http://localhost:5173.
Vite's hot module replacement feature also allows you to instantly view changes in the web browser when code is modified, which is a really nice touch.

Most of the app works without the backend.
However, to create your own scenarios and calculate their impacts, you will need to launch the backend as well.
In a new terminal window, `cd` into the top-level repository and:

```
make be-deps   # First time only
make be
```

To run both frontend and backend concurrently, do:

```
make fe-deps   # First time only
make be-deps   # First time only
make local
```

Note that the backend must be exposed on port 5174; this is where the frontend expects to find it.
Specifically, the frontend looks for the `/api/` endpoint, which Vite reverse-proxies to port 5174.

When running under Docker, the backend is not exposed to the host computer (it is only exposed to other containers).
Running this locally is the only way to directly test the backend.


## Related repositories

This web app is powered by two other repositories:

- [LandUseDemonstrator](https://github.com/ciupava/LandUseDemonstrator) contains the modelling work which is responsible for the predicted indicator values.
- [demoland_engine](https://github.com/martinfleis/demoland_engine) is a self-contained package which hosts the final trained models, as well as a REST API which is used as the backend here.
