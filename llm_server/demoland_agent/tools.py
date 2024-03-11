from langchain.agents import tool
import geopandas as gp
import pandas as pd


@tool
def find_points_of_interest(ammenity_type:str):
    """Provides the locations of different types of ammenties. Given an ammenity_type this function searches open street map and returns a json object representing a list of those types of ammenities"""
    print(ammenity_type)
    bounds = ",".join([str(b) for b in region_bounds])
    query =  f'''
                node["amenity"="{ammenity_type}"]({bounds});
                out body;
        '''
    
    result = overpass_api.query(query)
    features = []
    for node in result.nodes:
        features.append([node.lon,node.lat,node.tags.get("name")])
     
    
    return pd.DataFrame(features, columns=["lon","lat","name"]).to_csv()

@tool 
def signature_at_points(points):
    """Given a geojson object of points, return a geodataframe of the spatial signature of the region that contains each point"""
    from io import StringIO  
    
    points = gp.read_file(StringIO(json.dumps(points)))
    print("Points are ", points)

    return gp.sjoin(signatures,points, op="contains").rename(columns={"type":"signature"})[["signature"]]

@tool 
def scenario_change_at_point(points):
    """For the current scenario and an input list of points in geojson format, this function provides the changes in air pollution, house prices and access to greenspace for those points"""
    from io import StringIO  
    points = gp.read_file(StringIO(json.dumps(points)))
    return gp.GeoDataFrame(scenario_1).sjoin(points,op="contains")

@tool 
def signature_descriptions():
    """Returns the descriptions of each signature as json"""
    return sig_descriptions


@tool
def get_rergion_names():
    """Returns a list of regions avaliable to query on"""
    return regions['name'].to_csv()

@tool
def summarize_in_region(region:str):
    """Summarizes data in a geographic region. Should not be used for categories of location like resturants"""
    region_geo = regions[regions['name']==region]
    return gp.sjoin(region_geo,signatures)['type'].value_counts().to_csv()
    
@tool
def get_spatial_signature_list():
    """Returns the names and counts of each spatial signature"""
    return sig_types.to_csv()