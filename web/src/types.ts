// A GeoJSON FeatureCollection, but narrowed down such that each of the features
// is either a Polygon or a MultiPolygon.
export type PMPFeature = GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon, GeoJSON.GeoJsonProperties>;
export interface PMPFeatureCollection extends GeoJSON.GeoJsonObject {
    type: "FeatureCollection";
    features: Array<PMPFeature>;
}
