import json
from channels.generic.websocket import AsyncWebsocketConsumer

class PollConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        print("✅ WebSocket connected")

    async def disconnect(self, close_code):
        print("❌ WebSocket disconnected")

    async def receive(self, text_data):
        print("📩 Message received:", text_data)
        await self.send(text_data=json.dumps({
            "message": "Hello from Django!"
        }))
