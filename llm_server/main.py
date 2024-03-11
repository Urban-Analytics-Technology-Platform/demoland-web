from typing import Union
from fastapi import FastAPI,WebSocket
from fastapi.responses import HTMLResponse
from demoland_agent import DemolandAgent 
from demoland_agent.utils import load_scenario 
import datetime

print("loading baseline")
baseline  = load_scenario("../src/data/scenarios/baseline.json")
print("loading sceanrio1")
scenario1 = load_scenario("../src/data/scenarios/scenario1.json", baseline)

app = FastAPI()

html = """
<!DOCTYPE html>
<html>
    <head>
        <title>Chat</title>
    </head>
    <body>
        <h1>WebSocket Chat</h1>
        <form action="" onsubmit="sendMessage(event)">
            <input type="text" id="messageText" autocomplete="off"/>
            <button>Send</button>
        </form>
        <ul id='messages'>
        </ul>
        <script>
            var ws = new WebSocket("ws://localhost:8000/ws");
            ws.onmessage = function(event) {
                var messages = document.getElementById('messages')
                var message = document.createElement('li')
                var content = document.createTextNode(event.data)
                message.appendChild(content)
                messages.appendChild(message)
            };
            function sendMessage(event) {
                var input = document.getElementById("messageText")
                ws.send(input.value)
                input.value = ''
                event.preventDefault()
            }
        </script>
    </body>
</html>
"""

@app.get("/")
def read_root():
    return HTMLResponse(html)


@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    # print("Created agent")
    
    await websocket.accept()

    agent = DemolandAgent(scenario1);

    inital_message= {
        "text" : "Hi I am your helpful demoland bot. Ask me questions about the scenario you just ran!", 
        "isUser": False, 
        "timestamp": str(datetime.datetime.now())
    } 
    

    await websocket.send_json(inital_message)

    while True:
        prompt = await websocket.receive_json()
        print("Got prompt ", prompt)
        result = agent.query(prompt["text"])
        response = {
            "text" : result["output"], 
            "isUser": False, 
            "timestamp": str(datetime.datetime.now()) 
        } 
        await websocket.send_json(response)
