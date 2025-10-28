import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Poll, ChatMessage

#  Global consumer for poll creation, deletion, and vote updates
class GlobalPollConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.channel_layer.group_add("polls_global", self.channel_name)
        await self.accept()
        print(" Global WS connected")

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard("polls_global", self.channel_name)
        print("❌ Global WS disconnected")

    async def receive(self, text_data):
        data = json.loads(text_data)
        msg_type = data.get("type")

        # Broadcast create/delete/vote updates to all clients
        if msg_type in ["poll_created", "poll_deleted", "vote_update"]:
            await self.channel_layer.group_send(
                "polls_global",
                {"type": "polls_broadcast", "msg_type": msg_type}
            )

    async def polls_broadcast(self, event):
        await self.send(text_data=json.dumps({
            "type": event["msg_type"]
        }))


# Per-poll consumer (chat + vote)
class PollConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.poll_id = self.scope['url_route']['kwargs']['poll_id']
        self.room_group_name = f"poll_{self.poll_id}"

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()
        print(f" Connected to Poll Chat #{self.poll_id}")

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
        print(f"Disconnected from poll {self.poll_id}")

    async def receive(self, text_data):
        data = json.loads(text_data)
        msg_type = data.get("type")

        #  Vote updates
        if msg_type == "vote_update":
            await self.channel_layer.group_send(
                self.room_group_name,
                {"type": "vote_broadcast"}
            )

        #  Chat messages
        elif msg_type == "chat_message":
            message = data.get("text", "")
            user = data.get("user", "Anonymous")

            if message:
                await self.save_message(user, message)
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {"type": "chat_broadcast", "user": user, "text": message}
                )

    async def chat_broadcast(self, event):
        await self.send(text_data=json.dumps({
            "type": "chat_message",
            "user": event["user"],
            "text": event["text"],
        }))

    async def vote_broadcast(self, event):
        await self.send(text_data=json.dumps({
            "type": "vote_update",
        }))

    @database_sync_to_async
    def save_message(self, user, text):
        poll = Poll.objects.get(id=self.poll_id)
        ChatMessage.objects.create(poll=poll, user=user, content=text)
