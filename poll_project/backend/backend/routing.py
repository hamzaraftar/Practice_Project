import json
from channels.generic.websocket import AsyncWebsocketConsumer

class PollConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_group_name = "polls"

        # Join the room group (so all clients share messages)
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()
        print(" WebSocket connected")

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        print(" WebSocket disconnected")

    async def receive(self, text_data):
        data = json.loads(text_data)
        print(" Received:", data)

        # Broadcast the event to everyone in the group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "poll_update",
                "message": data.get("type", "update"),
            }
        )

    async def poll_update(self, event):
        # Send the message to WebSocket
        await self.send(text_data=json.dumps({
            "message": event["message"]
        }))
