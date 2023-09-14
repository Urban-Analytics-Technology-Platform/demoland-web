# Land Use Demonstrator Web App

**https://alan-turing-institute.github.io/demoland-web**

Web app for visualisation of modelling and results from the Land Use Demonstrator project.

- [The Geospatial Commission's blog post](https://www.landusedialogues.gov.uk/2023/03/13/using-spatial-data-science-to-deliver-more-from-the-same-land/) about the project
- The GitHub repositories containing the code powering this project: [LandUseDemonstrator](https://github.com/ciupava/LandUseDemonstrator), [demoland_engine](https://github.com/martinfleis/demoland_engine)
- [A page on the Alan Turing Institute's intranet, Mathison](https://mathison.turing.ac.uk/page/2864), about the project.

The frontend (in Svelte/TypeScript) is in the `web` directory; the backend (in Python) is in the [`demoland_engine` submodule](https://github.com/martinfleis/demoland_engine).

## Running locally

```
git clone --recursive git@github.com:alan-turing-institute/demoland-web.git
cd demoland-web
npm install
npm run dev
```

then navigate to http://localhost:5173.

## Data sources used for visualisation

- **Map tiles:** [MapTiler](https://cloud.maptiler.com/maps/)
- **GeoJSON for output areas:** [ONS Open Geography Portal](https://geoportal.statistics.gov.uk/datasets/ons::output-areas-dec-2011-boundaries-ew-bgc/about)

Data used in the modelling [is described elsewhere](https://ciupava.github.io/LandUseDemonstrator/data_sources.html).
