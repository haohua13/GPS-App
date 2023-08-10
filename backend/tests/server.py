import asyncio
import websockets

# create handler for each connection
async def handler(websocket, path):
    while True:
        data = await websocket.recv()
        reply = f"User Data received as: {data}!"
        await websocket.send(reply)
        
start_server = websockets.serve(handler, "localhost", 5000)
asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()
