# Land Use Demonstrator Web App

**https://alan-turing-institute.github.io/demoland-web**

Frontend for visualisation of modelling and results from the Land Use Demonstrator project.

- [The Geospatial Commission's blog post](https://www.landusedialogues.gov.uk/2023/03/13/using-spatial-data-science-to-deliver-more-from-the-same-land/) about the project
- The GitHub repositories containing the code powering this project: [LandUseDemonstrator](https://github.com/ciupava/LandUseDemonstrator), [demoland_engine](https://github.com/martinfleis/demoland_engine)
- [A page on the Alan Turing Institute's intranet, Mathison](https://mathison.turing.ac.uk/page/2864), about the project.

## Local development (without custom scenarios)

1. [Download Node.js](https://nodejs.org/en/download) if you don't already have it.
2. Clone the repository and run `npm install` inside it.
3. Run `npm run dev` and open http://localhost:5173 in a browser window.

## Local usage (with custom scenarios)

Same as above, but additionally, run:

1. `npm run api-build` to build the Docker image containing the Python API
2. `npm run dev+api` to launch the web app on port 5173 and Python API on port 5174

Again, the app can be launched via http://localhost:5173.

## Building static files

`npm run build` will build the website will be built inside the `dist` folder.
You can launch a HTTP server from that directory to view the website.

## Data sources used for visualisation

- **Map tiles:** [MapTiler](https://cloud.maptiler.com/maps/)
- **GeoJSON for output areas:** [ONS Open Geography Portal](https://geoportal.statistics.gov.uk/datasets/ons::output-areas-dec-2011-boundaries-ew-bgc/about)

Data used in the modelling [is described elsewhere](https://ciupava.github.io/LandUseDemonstrator/data_sources.html).
