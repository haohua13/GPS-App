import asyncio
import websockets
from data import Data

# create data object
data_class = Data()

# create handler for each connection
async def handler(websocket, path):
    while True:
        data = await websocket.recv()
        if (data.startswith('{"radius"')):
                print(data)
                data_class.update(data)
        reply = f"User Data received as: {data}!"
        await websocket.send(reply)
        
start_server = websockets.serve(handler, "localhost", 5000)
asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()
