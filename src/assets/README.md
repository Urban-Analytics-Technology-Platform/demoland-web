## Description of files in here

- `baseline_oa.csv` = calculated baseline values for OAs, exported from notebook as csv, five columns: `geo_code`, `air_quality`, `house_price`, `job_accessibility`, `greenspace_accessibility`
  - 3795 OAs in total
- `baseline_oa.json` = the same as above but converted to JSON using `csv_to_json.py`
- `scenario1_oa.json` and `scenario2_oa.json` = fully synthetic data obtained by performing KDE on baseline values, to be used for testing purposes only

- `newcastle.geojson` = the above OAs exported from the data in OneDrive demoland folder `/processed/interpolated/all_oa.parquet`
    
        geom = gpd.read_parquet(...)
        # MapLibre uses EPSG:4326 coordinate system, so we have to switch
        geom.to_crs(epsg=4326)[['geo_code', 'geometry']].to_file('newcastle.geojson', driver='GeoJSON')

Other sources of data:
- `oa2021.geojson` = raw geoJSON downloaded from https://geoportal.statistics.gov.uk/datasets/ons::output-areas-2021-ew-bfe/explore
  - OAs are calculated from census data every 10 years. The present dataset uses 2021 data
  - 188880 OAs in total, takes ages (like 1.5 mins) to load in geopandas
- `oa2021_subset.geojson` = `oa2021.geojson` but subsetted such that only the OAs in baseline_oa.csv appear (using code in `restrict_oas.py`)
  - 3683 OAs in total, takes ~2 seconds to load.
  - Not sure why we couldn't find all 3795 OAs inside here??
