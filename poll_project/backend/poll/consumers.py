import json
from channels.generic.websocket import AsyncWebsocketConsumer

class PollConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.channel_layer.group_add("polls_group", self.channel_name)
        await self.accept()
        await self.send(text_data=json.dumps({"message": "Hello from server!"}))
        print("✅ WebSocket connected")

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard("polls_group", self.channel_name)
        print("❌ WebSocket disconnected")

    async def receive(self, text_data):
        data = json.loads(text_data)
        msg_type = data.get("type")

        print(f"📩 Message received: {data}")

        # 🗳 Handle Poll/Vote updates
        if msg_type in ["vote_update", "poll_update"]:
            await self.channel_layer.group_send(
                "polls_group",
                {"type": "broadcast_message", "message": msg_type}
            )

        # 💬 Handle Chat Messages
        elif msg_type == "chat_message":
            message = data.get("text", "")
            if message:
                await self.channel_layer.group_send(
                    "polls_group",
                    {"type": "chat_broadcast", "text": message}
                )

    async def broadcast_message(self, event):
        await self.send(text_data=json.dumps({"message": event["message"]}))

    async def chat_broadcast(self, event):
        await self.send(text_data=json.dumps({
            "type": "chat_message",
            "text": event["text"]
        }))
