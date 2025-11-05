import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import CustomUser, Poll, ChatMessage
from .serializers import ChatMessageSerializer

#  Global consumer (poll CRUD + vote updates)
class GlobalPollConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.channel_layer.group_add("polls_global", self.channel_name)
        await self.accept()        

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard("polls_global", self.channel_name)        

    async def receive(self, text_data):
        data = json.loads(text_data)
        msg_type = data.get("type")

        if msg_type in ["poll_created", "poll_deleted", "vote_update"]:
            await self.channel_layer.group_send(
                "polls_global",
                {"type": "polls_broadcast", "msg_type": msg_type}
            )

    async def polls_broadcast(self, event):
        await self.send(text_data=json.dumps({
            "type": event["msg_type"]
        }))

# Poll Consumer (Chat + Vote)
class PollConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.poll_id = self.scope["url_route"]["kwargs"]["poll_id"]
        self.room_group_name = f"poll_{self.poll_id}"

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()        

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
       

    #  Handle Messages From WebSocket

    async def receive(self, text_data):
        data = json.loads(text_data)
        msg_type = data.get("type")

        # VOTE UPDATE
        if msg_type == "vote_update":
            await self.channel_layer.group_send(
                self.room_group_name,
                {"type": "vote_broadcast"}
            )

        # CHAT MESSAGE
        elif msg_type == "chat_message":
            # Frontend sends: { user: {username, is_admin, email}, text }
            user_data = data.get("user", {})
            username = user_data.get("username")

            text = data.get("text", "").strip()
            if not username or not text:
                return

            #  Save message & get full serialized data
            saved_msg = await self.save_message(username, text)
            serialized_msg = ChatMessageSerializer(saved_msg).data

            #  Broadcast FULL message (same structure as REST API)
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "chat_broadcast",
                    "message": serialized_msg
                }
            )

    #  Send message to WebSocket
    async def chat_broadcast(self, event):
        await self.send(text_data=json.dumps({
            "type": "chat_message",
            **event["message"]   # send id, username, content, is_admin, timestamp
        }))

    #  Send vote updates
    async def vote_broadcast(self, event):
        await self.send(text_data=json.dumps({
            "type": "vote_update"
        }))

    #  Save message & return created instance
    @database_sync_to_async
    def save_message(self, username, text):
        poll = Poll.objects.get(id=self.poll_id)
        user = CustomUser.objects.get(username=username)

        return ChatMessage.objects.create(
            poll=poll,
            user=user,
            content=text
        )
