import os

from dotenv import load_dotenv
load_dotenv() 
from .utils import load_geography,load_regions, load_signatures,load_pen_portaits
import geopandas as gp
import pandas as pd 
from langchain.agents import tool
from langchain_core.messages import AIMessage, HumanMessage
import overpy
import json
# Import things that are needed generically
from langchain.pydantic_v1 import BaseModel, Field
from langchain_experimental.tools.python.tool import PythonAstREPLTool

overpass_api = overpy.Overpass()
from langchain_community.tools.convert_to_openai import format_tool_to_openai_function
from langchain_openai import ChatOpenAI
from langchain.agents.format_scratchpad import format_to_openai_function_messages
from langchain.agents.output_parsers import OpenAIFunctionsAgentOutputParser
from langchain_experimental.agents.agent_toolkits import create_pandas_dataframe_agent
from langchain.agents import AgentExecutor
from langchain.agents.agent_types import AgentType


PythonAstREPLTool_init = PythonAstREPLTool.__init__

def PythonAstREPLTool_init_wrapper(self, *args, **kwargs):
    PythonAstREPLTool_init(self, *args, **kwargs)
    self.globals = self.locals

PythonAstREPLTool.__init__ = PythonAstREPLTool_init_wrapper


print("Key ", os.environ["OPENAI_API_KEY"])
print("Key 2 ",os.environ["OPEN_AI_KEY"])
print("loading env ")


class ScenarioChangeAtPointSchema(BaseModel):
    points: str = Field(description="A json list of points each having a latitude, longitude and name field")


class DemolandAgent:
    def __init__(self,scenario):
        self._scenario = scenario
        self._chat_history = []
        self.prompt= ""
        self._construct_prompt()
        self._construct_agent()
        self._region_bounds = [54.79904934, -1.85265924, 55.07938255, -1.3472978]

    def _construct_prompt(self):
        from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
        MEMORY_KEY = "chat_history"
        prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    """You are very powerful geospatial assistant, but don't know current events. If asked about places physical locations you dont know, 
                    for example schools, hospitals, grocery stores etc, use the find_points_of_interest tool to look them up. Make your responses conversational 
                    as if you where reporting them in a talk. If asked to report changes only report non zero changes. 
                    """,
                ),
                MessagesPlaceholder(variable_name=MEMORY_KEY),
                ("user", "{input}"),
                MessagesPlaceholder(variable_name="agent_scratchpad"),
            ]
        )
        self._prompt = prompt
        
    def _construct_agent(self):
        
        print("loading regions")
        regions = load_regions()
        print("loading signature descriptions")
        sig_descriptions = load_pen_portaits()
        print("loading geography")
        geography = load_geography()
        print("loading signatures")
        signatures= load_signatures()
        print("loading sig types")
        sig_types = signatures["type"].value_counts().to_frame()

        tools = self.tools(regions,sig_descriptions, geography,signatures,sig_types)

        print("Scenario is ")
        print(self._scenario)
        print("Scenario columns are ")
        print(self._scenario.columns)


        executor= create_pandas_dataframe_agent(
            # ChatOpenAI(temperature=0, model="gpt-4"),
            ChatOpenAI(temperature=0, model="gpt-4"),
            self._scenario,
            verbose=True,
            agent_type=AgentType.OPENAI_FUNCTIONS,#,AgentType.ZERO_SHOT_REACT_DESCRIPTION,
            extra_tools= tools,
            handle_parsing_errors=True,
            prefix="""You are very powerful geospatial assistant, but don't know current events. If asked about places physical locations you dont know, 
                    for example schools, hospitals, grocery stores etc, use the find_points_of_interest tool to look them up. Make your responses conversational 
                    as if you where reporting them in a talk. 

                    If a dataframe has a geometry column, treat these as geopandas dataframes. IMD means index of multiple deprivation                    """,
                        
            return_intermediate_steps = True
        )
        
        # llm = ChatOpenAI(
        #                  # model="gpt-4",
        #                  # model="gpt-3.5-turbo", 
        #                  temperature=0
        #                  )
        # llm_with_tools = llm.bind(functions=[format_tool_to_openai_function(t) for t in tools])
        # agent = (
        #     {
        #         "input": lambda x: x["input"],
        #         "agent_scratchpad": lambda x: format_to_openai_function_messages(
        #             x["intermediate_steps"]
        #         ),
        #         "chat_history": lambda x: x["chat_history"],
        #     }
        #     | self._prompt
        #     | llm_with_tools
        #     | OpenAIFunctionsAgentOutputParser()
        # )
        # executor = AgentExecutor(agent=agent, tools=self.tools(), verbose=True, return_intermediate_steps=True)

        self._executor = executor

    def query(self,query:str):
        result = self._executor.invoke({"input": query,"chat_history": self._chat_history})
        self._chat_history.extend([
            HumanMessage(content=query),
            AIMessage(content=result["output"])
        ]
        )
        return result

    def tools(self,regions,sig_descriptions,geography,signatures,sig_types):


        @tool
        def find_points_of_interest(ammenity_type:str):
            """Provides the locations of different types of ammenties. Given an ammenity_type this function searches open street map and returns a json object representing a list of those types of ammenities"""
            print(ammenity_type)
            bounds = ",".join([str(b) for b in self._region_bounds])
            query =  f'''
                        node["amenity"="{ammenity_type}"]({bounds});
                        out body;
                '''
    
            result = overpass_api.query(query)
            features = []
            for node in result.nodes:
                features.append([node.lon,node.lat,node.tags.get("name")])
         
            return pd.DataFrame(features, columns=["lon","lat","name"]).to_json()

        @tool 
        def signature_at_points(points):
            """Given a geojson object of points, return a geodataframe of the spatial signature of the region that contains each point"""
            from io import StringIO  
    
            points = gp.read_file(StringIO(json.dumps(points)))

            print("Points are ", points, type(points))

            return gp.sjoin(signatures,points, op="contains").rename(columns={"type":"signature"})[["signature"]]

        @tool(args_schema=ScenarioChangeAtPointSchema)
        def scenario_change_at_point(points):
            """For the current scenario and an input list of points in geojson format, this function provides the changes in air pollution, house prices and access to greenspace for those points"""
            from io import StringIO  
            print(points)
            points = json.loads(points)
            names =  [point["name"] for point in points]
            latitudes=  [point["latitude"] for point in points]
            longitudes=  [point["longitude"] for point in points]
            points_df = gp.GeoDataFrame({"name": names}, geometry=gp.points_from_xy(x=longitudes, y=latitudes), crs="EPSG:4326")
            result = gp.GeoDataFrame(self._scenario).sjoin(points_df,op="contains")
            print("Change in point result" ,result.head())
            print("Change in point columns" ,result.columns)
            return result.drop(["geometry"], axis=1).to_markdown()

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

        tools = [
                 #summarize_in_region,
                 #get_spatial_signature_list,
                 scenario_change_at_point,
                 #get_rergion_names,
                 #signature_descriptions,
                 find_points_of_interest]
                 # signature_at_points]
        return tools
