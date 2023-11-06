const {loadPyodide}= require("pyodide")
const fs = require('fs')

let program=`
import geopandas as gpd
import numpy as np
import pickle

import pandas as pd
from sklearn.ensemble import HistGradientBoostingRegressor


air_regressor = HistGradientBoostingRegressor(
    random_state=0, max_bins=64, max_iter=1000
)
data=  pd.read_csv("/air_quality_training_data.csv")
housing_data=  pd.read_csv("/house_training_vars.csv")
vars = data.drop("air_quality",axis=1)


target = data["air_quality"]
air_reg = air_regressor.fit(vars, target)

with open("/air_weights.pickle","rb") as f:
  W= pickle.load(f)


mod = (W,air_reg)
with open("/air_predictor_model.pickle","wb") as f:
  pickle.dump(mod,f)

house_regressor = HistGradientBoostingRegressor(
    random_state=0, max_bins=64, max_iter=1000
)

vars =  housing_data.drop("house_price",axis=1)
target = housing_data["house_price"]

house_reg = house_regressor.fit(vars,target)

mod = (W,house_reg)
with open("/house_predictor_model.pickle","wb") as f:
  pickle.dump(mod,f)

`

async function loadPickles(pyodide){
  const data = fs.readFileSync("/Users/slynn/Projects/LandUseDemonstrator/code/02_models/air_quality_training_data.csv",'utf8')
  console.log("loaded data ")
  pyodide.FS.writeFile("/air_quality_training_data.csv", data, { encoding: "utf8" });
  const house_training = fs.readFileSync("/Users/slynn/Projects/LandUseDemonstrator/code/02_models/house_training_vars.csv",'utf8')
  console.log("loaded data ")
  pyodide.FS.writeFile("/house_training_vars.csv", house_training, { encoding: "utf8" });

  const data2 = fs.readFileSync("/Users/slynn/Projects/LandUseDemonstrator/code/03_prediction/air_weights.pickle")
  console.log("loaded data ")
  pyodide.FS.writeFile("/air_weights.pickle", data2);

}

async function getResults(pyodide){
  console.log("Getting results")
  const house_prediction_model = pyodide.FS.readFile("/house_predictor_model.pickle")
  fs.writeFileSync("./house_predictor_model.pickle",house_prediction_model)
  const air_quality_model = pyodide.FS.readFile("/air_predictor_model.pickle")
  fs.writeFileSync("./air_predictor_model_new.pickle",air_quality_model)
}

async function generateModelPickles(){

  let pyodide = await loadPyodide();
  await pyodide.loadPackage(["micropip","fastparquet"]);
  const micropip = pyodide.pyimport("micropip")
  console.log("Loaded micro pip")
  await micropip.install("lzma")
  await micropip.install("file:///Users/slynn/Projects/demoland-web/demoland_engine/wheel_build/libpysal-4.7.0-py3-none-any.whl")
  // await micropip.install("file:///Users/slynn/Projects/demoland-web/demoland_engine/wheel_build/demoland_engine-1.1.1.dev22+g17677c0.d20231103-py3-none-any.whl");
  console.log("Loaded demoland")
  loadPickles(pyodide) 
  console.log("Loaded pickels")
  
  await pyodide.loadPackagesFromImports(program)
  console.log("loaded packages. Running code")
  let results = await pyodide.runPythonAsync(program)
  getResults(pyodide)

}

generateModelPickles().then(()=>process.exit(0))


