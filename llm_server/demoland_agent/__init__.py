from .utils import load_geography,load_regions, load_signatures,load_pen_portaits
import geopandas as gp
import pandas as pd 
from langchain.agents import tool
from langchain_core.messages import AIMessage, HumanMessage
import overpy
import json

overpass_api = overpy.Overpass()


from dotenv import load_dotenv
print("loading env ")
load_dotenv() 

class DemolandAgent:
    def __init__(self,scenario):
        self._scenario = scenario
        self._chat_history = []
        self.prompt= ""
        self._construct_prompt()
        self._construct_agent()
        self._region_bounds = [54.894617,-1.853227,55.089348, -1.391386]        

    def _construct_prompt(self):
        from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
        MEMORY_KEY = "chat_history"
        prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    """You are very powerful geospatial assistant, but don't know current events. If asked about places physical locations you dont know, 
                    for example schools, hospitals, grocery stores etc, use the find_points_of_interest tool to look them up. Make your responses conversational 
                    as if you where reporting them in a talk. 
                    """,
                ),
                MessagesPlaceholder(variable_name=MEMORY_KEY),
                ("user", "{input}"),
                MessagesPlaceholder(variable_name="agent_scratchpad"),
            ]
        )
        self._prompt = prompt
        
    def _construct_agent(self):
        from langchain_community.tools.convert_to_openai import format_tool_to_openai_function
        from langchain_openai import ChatOpenAI
        from langchain.agents.format_scratchpad import format_to_openai_function_messages
        from langchain.agents.output_parsers import OpenAIFunctionsAgentOutputParser
        from langchain.agents import AgentExecutor
        tools = self.tools()

        llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)
        llm_with_tools = llm.bind(functions=[format_tool_to_openai_function(t) for t in tools])
        
        agent = (
            {
                "input": lambda x: x["input"],
                "agent_scratchpad": lambda x: format_to_openai_function_messages(
                    x["intermediate_steps"]
                ),
                "chat_history": lambda x: x["chat_history"],
            }
            | self._prompt
            | llm_with_tools
            | OpenAIFunctionsAgentOutputParser()
        )

        self._executor = AgentExecutor(agent=agent, tools=self.tools(), verbose=True)

    def query(self,query:str):
        result = self._executor.invoke({"input": query,"chat_history": self._chat_history})
        self._chat_history.extend([
            HumanMessage(content=query),
            AIMessage(content=result["output"])
        ]
        )
        return result

    def tools(self):
        print("loading regions")
        regions = load_regions()
        print("loading signature descriptions")
        sig_descriptions = load_pen_portaits()
        print("loading geography")
        geography = load_geography()
        print("loading signatures")
        signatures= load_signatures()


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
            print(points)
            points = gp.read_file(StringIO(json.dumps(points)))
            return gp.GeoDataFrame(self._scenario).sjoin(points,op="contains")

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

        tools = [summarize_in_region, get_spatial_signature_list, scenario_change_at_point, get_rergion_names, signature_descriptions, find_points_of_interest,signature_at_points]
        return tools
