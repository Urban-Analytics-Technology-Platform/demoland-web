# Land Use Demonstrator Web App

**https://alan-turing-institute.github.io/demoland-web**

Web app for visualisation of modelling and results from the Land Use Demonstrator project.

- [The Geospatial Commission's blog post](https://www.landusedialogues.gov.uk/2023/03/13/using-spatial-data-science-to-deliver-more-from-the-same-land/) about the project
- The GitHub repositories containing the code powering this project: [LandUseDemonstrator](https://github.com/ciupava/LandUseDemonstrator), [demoland_engine](https://github.com/martinfleis/demoland_engine)
- [A page on the Alan Turing Institute's intranet, Mathison](https://mathison.turing.ac.uk/page/2864), about the project.

The frontend (in Svelte/TypeScript) is in the `web` directory; the backend (in Python) is in the [`demoland_engine` submodule](https://github.com/martinfleis/demoland_engine).

## Running locally

The easiest way is probably using Docker.
Make sure to include the submodules when cloning.

```
git clone --recursive git@github.com:alan-turing-institute/demoland-web.git
cd demoland-web
docker-compose up
```

then navigate to http://localhost:5173.

## Local development

First, clone the repository as before:

```
git clone --recursive git@github.com:alan-turing-institute/demoland-web.git
cd demoland-web
```

For the frontend:

```
cd web
npm install
npm run dev  # defaults to port 5173
```

For the backend, `cd` back into the top-level repository and:

```
cd demoland_engine
python -m venv venv/api
source venv/api/bin/activate
python -m pip install .[api]
uvicorn --app-dir api main:app --port 5174
```

Note that the backend must be exposed on port 5174; this is where the frontend expects to find it.
