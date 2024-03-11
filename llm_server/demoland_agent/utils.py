import geopandas as gp
import pandas as pd
import json

sig_lookup = {
    0 :'Wild countryside',
    1:'Countryside agriculture',
    2:'Urban buffer',
    3:'Warehouse/Park land',
    4:'Open sprawl',
    5:'Disconnected suburbia',
    6:'Accessible suburbia',
    7:'Connected residential neighbourhoods',
    8:'Dense residential neighbourhoods',
    9:'Gridded residential quarters',
    10:'Dense urban neighbourhoods',
    11:'Local urbanity',
    12:'Regional urbanity',
    13:'Metropolitan urbanity',
    14:'Concentrated urbanity',
    15:'Hyper concentrated urbanity'
}

CACHE = {}


def load_pen_portaits():
    if("portraits" in CACHE):
        return CACHE["portraits"]    
    with open("./data/pen_portraits.json") as f:
        sig_descriptions = json.load(f)
    CACHE["portraits"] = sig_descriptions
    return sig_descriptions

def load_signatures():
    if("signatures" in CACHE):
        return CACHE["signatures"]    
    signatures = gp.read_file("./data/signatures_newcastle.geojson")
    # signatures = gp.read_file("./data/spatial_signatures_GB.gpkg")
    # signatures = signatures.to_crs("EPSG:4326")
    CACHE["signatures"] = signatures
    return signatures

def load_regions():
    if("regions" in CACHE):
        return CACHE["regions"]    
    regions = gp.read_file("./data/counties.geojson")
    regions["name"] = [val[0] for val in regions["ctyua_name"].values]
    regions = regions.to_crs("EPSG:4326")
    CACHE["regions"]=regions
    return regions


def load_geography():
    if("geography" in CACHE):
        return CACHE["geography"]

    CACHE["geography"]=gp.read_file("./data/geograph.json")
    return CACHE["geography"]

def load_scenario(file, baseline=None):
    if file in CACHE:
        return CACHE[file]

    geography = load_geography()
    with open(file) as f:
        scenario= json.load(f)
    result =  pd.DataFrame.from_records(scenario["values"]).T
    result.signature_type = result.signature_type.apply(lambda x: sig_lookup[x])
    if(baseline is not None):
        diff_cols = ["air_quality", "house_price", "job_accessibility", "greenspace_accessibility"] 	
        diffs=(result[diff_cols] - baseline[diff_cols]).rename(columns = lambda x: "diff_"+x)
        result = pd.merge(result, diffs, left_index=True, right_index=True)
    result = gp.GeoDataFrame(pd.merge( result, geography.set_index("OA11CD"), left_index=True, right_index=True).drop("id", axis=1))
    CACHE[file]= result 
    return result
    
