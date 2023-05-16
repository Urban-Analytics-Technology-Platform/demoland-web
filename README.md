# Land Use Demonstrator Web App

**https://alan-turing-institute.github.io/demoland-web**

Frontend for visualisation of modelling and results from the Land Use Demonstrator project ([GitHub](https://github.com/ciupava/LandUseDemonstrator), [Mathison](https://mathison.turing.ac.uk/page/2864)).

## Local usage

1. [Download Node.js](https://nodejs.org/en/download) if you don't already have it.
2. Clone the repository and run `npm install` inside it.
3. To develop locally, run `npm run dev`.
4. To build the static website, run `npm run build`.
   The website will be built inside the `dist` folder; you can launch a HTTP server from that directory to view the website.

## Data sources

- **Map tiles:** [MapTiler](https://cloud.maptiler.com/maps/)
- **GeoJSON output areas:** [ONS Open Geography Portal](https://geoportal.statistics.gov.uk/datasets/ons::output-areas-2021-ew-bfe/about)
