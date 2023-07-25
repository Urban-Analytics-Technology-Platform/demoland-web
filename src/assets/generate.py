"""
generate.py
-----------

Regenerates all data needed for the web app.

To run, set the $DEMOLAND_DATA environment variable to the location of the shared DemoLand OneDrive folder.
"""

import pandas as pd
import geopandas as gpd
import numpy as np
import demoland_engine

import os
from pathlib import Path


# ---- DemoLand data folder (should be in OneDrive) -------------------------
data_folder = os.environ.get('DEMOLAND_DATA')
if data_folder is None:
    raise ValueError('Please set $DEMOLAND_DATA to point to the shared'
                     ' DemoLand OneDrive folder.')
# Convert to pathlib.Path and check for existence
data_folder = Path(data_folder)
if not data_folder.is_dir():
    raise ValueError(f'Data folder {data_folder} does not exist.'
                      'Please set $DEMOLAND_DATA to point to the shared'
                      ' DemoLand OneDrive folder.')

# ---- Output folders -------------------------------------------------------
# Values folder (used for values that are plotted on the map)
values_dir = Path(__file__).parent / 'values'
if not values_dir.is_dir():
    values_dir.mkdir()
# Input changes folder (used to store differences in the inputs relative to the
# baseline)
changes_dir = Path(__file__).parent / 'input-changes'
if not changes_dir.is_dir():
    changes_dir.mkdir()

# ---- Initialisation -------------------------------------------------------
RANDOM_SEED = 42
SIGS = {
    'Wild countryside': 0,
    'Countryside agriculture': 1,
    'Urban buffer': 2,
    'Warehouse/Park land': 3,
    'Open sprawl': 4,
    'Disconnected suburbia': 5,
    'Accessible suburbia': 6,
    'Connected residential neighbourhoods': 7,
    'Dense residential neighbourhoods': 8,
    'Gridded residential quarters': 9,
    'Dense urban neighbourhoods': 10,
    'Local urbanity': 11,
    'Regional urbanity': 12,
    'Metropolitan urbanity': 13,
    'Concentrated urbanity': 14,
    'Hyper concentrated urbanity': 15,
}
BASELINE_USE = pd.read_parquet(f'{data_folder}/sampling/oa_key.parquet')
BASELINE_USE = (BASELINE_USE
                .assign(primary_type=BASELINE_USE['primary_type'].map(SIGS))
                .rename(columns={'primary_type': 'sig'})
                )
GEOM = gpd.read_parquet(f"{data_folder}/processed/interpolated/all_oa.parquet")

# ---- Generate baseline ----------------------------------------------------
df_baseline = demoland_engine.get_empty()
indis_baseline = (demoland_engine
                  .get_indicators(df_baseline, random_seed=RANDOM_SEED)
                  .join(BASELINE_USE, validate='one_to_one')
                  )
indis_baseline.to_json(f'{values_dir}/baseline.json', orient='index')

# ---- Generate scenarios ---------------------------------------------------
def scenario3_processing(input_df):
    vars, jobs, gsp = demoland_engine.sampling.get_data(input_df, random_seed=RANDOM_SEED)
    jobs[jobs < 0] = -1 * (jobs[jobs < 0] * .5)
    vars = vars.rename(columns={"population_estimate": "population"})
    aq = demoland_engine.predictors.air_quality_predictor.predict(vars)
    hp = demoland_engine.predictors.house_price_predictor.predict(vars)
    ja = demoland_engine.predictors.accessibility.job_accessibility(jobs, "walk")
    gs = demoland_engine.predictors.accessibility.greenspace_accessibility(gsp, "walk")
    ja = ja.to_pandas()[input_df.index].values
    gs = gs.to_pandas()[input_df.index].values
    return pd.DataFrame(
        {
            "air_quality": aq,
            "house_price": hp,
            "job_accessibility": ja,
            "greenspace_accessibility": gs,
        },
        index=input_df.index,
    )

def make_files_from_output(
    input_df: pd.DataFrame,
    output_df: pd.DataFrame,
    name: str,
):
    """
    Assumes you already have both the input dataframe (the 4 macro variables)
    as well as the output dataframe (the indicators). The latter can most
    simply be obtained by calling demoland_engine.get_indicators(input_df),
    but in some cases we need more special processing (see scenario3_processing
    above), and this function bypasses that step.
    """
    print(f"Generating files for {name}...")
    # Copy updated land use signatures from input dataframe
    use = BASELINE_USE.copy()
    use.loc[input_df['signature_type'].notnull(), 'sig'] = input_df['signature_type']
    # Merge to output dataframe
    values = output_df.join(use, validate='one_to_one')
    values.to_json(f'{values_dir}/{name}.json', orient='index')
    # Generate changes
    changes = input_df.loc[input_df['signature_type'].notnull() |
                                    input_df['use'].notnull() |
                                    input_df['greenspace'].notnull() |
                                    input_df['job_types'].notnull(),
                                    :]
    changes.to_json(f'{changes_dir}/{name}.json', orient='index')

def make_files(
    input_df: pd.DataFrame,
    name: str,
):
    """
    Generates all files for a given scenario, by first calling
    demoland_engine.get_indicators(input_df) and then calling
    make_files_from_output(input_df, output_df, name).
    """
    # Use input dataframe to generate values
    output_df = demoland_engine.get_indicators(input_df, random_seed=RANDOM_SEED)
    # Then generate the files
    make_files_from_output(input_df, output_df, name)


# Scenario 1
df1 = demoland_engine.get_empty()
OAs = ["E00042852", "E00042865", "E00042911", "E00042915"]
df1.loc[OAs, "signature_type"] = 5
make_files(df1, "scenario1")

# Scenario 2
df2 = demoland_engine.get_empty()
OAs = ["E00042852", "E00042865", "E00042911", "E00042915"]
df2.loc[OAs, "signature_type"] = 8
df2.loc[OAs, "greenspace"] = .2
make_files(df2, "scenario2")

# Scenario 3
nc = GEOM.cx[:430000, :]
oa_key = pd.read_parquet(f"{data_folder}/sampling/oa_key.parquet")

reg_urb = oa_key[oa_key.primary_type == "Regional urbanity"]
loc_urb = oa_key[oa_key.primary_type == "Local urbanity"]
dense_nei = oa_key[oa_key.primary_type == "Dense urban neighbourhoods"]

eg_urb = reg_urb[reg_urb.index.isin(nc.geo_code)]
loc_urb = loc_urb[loc_urb.index.isin(nc.geo_code)]
dense_nei = dense_nei[dense_nei.index.isin(nc.geo_code)]

only_adjacent = GEOM[GEOM.geo_code.isin(dense_nei.index)].sjoin(GEOM[GEOM.geo_code.isin(loc_urb.index)]).geo_code_left
all_changes = np.concatenate([reg_urb.index, loc_urb.index, only_adjacent])
parks = ["E00042873", "E00042595", "E00042594", "E00175564", "E00042584", "E00042654"]

df3 = demoland_engine.get_empty()
df3.loc[reg_urb.index.drop(parks, "ignore"), "signature_type"] = 13
df3.loc[loc_urb.index.drop(parks, "ignore"), "signature_type"] = 12
df3.loc[only_adjacent[~only_adjacent.isin(parks)], "signature_type"] = 11
make_files_from_output(df3, scenario3_processing(df3), "scenario3")

# Scenario 4
brownfield_OAs = gpd.read_file(f"{data_folder}/scenarios/OAs_tynewear_contains-brownfield.gpkg")
df4 = demoland_engine.get_empty()
df4.loc[df4.index.isin(brownfield_OAs.geo_code), "signature_type"] = 11
make_files(df4, "scenario4")

# Scenario 5
df5 = demoland_engine.get_empty()
df5.loc[df5.index.isin(brownfield_OAs.geo_code), "greenspace"] = .9
make_files(df5, "scenario5")

# Scenario 6
df6 = df3.copy()
df6.loc[df6.index.isin(brownfield_OAs.geo_code), "signature_type"] = 11
make_files_from_output(df6, scenario3_processing(df6), "scenario6")

# Scenario 7
df7 = df3.copy()
df7.loc[df7.index.isin(brownfield_OAs.geo_code), "greenspace"] = .9
make_files_from_output(df7, scenario3_processing(df7), "scenario7")
