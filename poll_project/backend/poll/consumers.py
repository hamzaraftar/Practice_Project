import json
from channels.generic.websocket import AsyncWebsocketConsumer

class PollConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.group_name = "polls_group"

        # Add this connection to the group
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        await self.accept()
        await self.send(text_data=json.dumps({"message": "Hello from Django!"}))
        print("✅ WebSocket connected")

    async def disconnect(self, close_code):
        # Remove from group
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )
        print("❌ WebSocket disconnected")

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get("type")

        print(f"📩 Message received: {data}")

        # Broadcast message to all clients in group
        await self.channel_layer.group_send(
            self.group_name,
            {
                "type": "poll_update_event",  # Custom handler
                "message": message_type,
            }
        )

    async def poll_update_event(self, event):
        message = event["message"]
        # Send message to WebSocket client
        await self.send(text_data=json.dumps({"message": message}))
