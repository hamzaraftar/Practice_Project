import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import CustomUser, Poll, ChatMessage
from .serializers import ChatMessageSerializer


#  GLOBAL POLL CONSUMER (create/delete poll + vote update)

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


#  PER-POLL CONSUMER (chat + vote)

class PollConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.poll_id = self.scope["url_route"]["kwargs"]["poll_id"]
        self.room_group_name = f"poll_{self.poll_id}"

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    #  WEB SOCKET RECEIVE
    async def receive(self, text_data):
        data = json.loads(text_data)
        msg_type = data.get("type")

        # Vote
        if msg_type == "vote_update":
            await self.channel_layer.group_send(
                self.room_group_name,
                {"type": "vote_broadcast"}
            )
            return

        #  Chat Message
        if msg_type == "chat_message":
            raw_user = data.get("user", None)

            #  Fix: allow both string and dict
            if isinstance(raw_user, dict):
                username = raw_user.get("username", None)
            elif isinstance(raw_user, str):
                username = raw_user
            else:
                username = None

            text = data.get("text", "").strip()

            if not username or not text:
                return  # Ignore invalid messages

            #  Save message
            saved_msg = await self.save_message(username, text)

            #  Serialize message (same as REST API)
            serialized = ChatMessageSerializer(saved_msg).data

            #  Broadcast full message
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "chat_broadcast",
                    "message": serialized
                }
            )

    #  SEND CHAT
    async def chat_broadcast(self, event):
        await self.send(text_data=json.dumps({
            "type": "chat_message",
            **event["message"]
        }))
   
    #  SEND VOTE UPDATE 
    async def vote_broadcast(self, event):
        await self.send(text_data=json.dumps({
            "type": "vote_update"
        }))

    #  SAVE MESSAGE    
    @database_sync_to_async
    def save_message(self, username, text):
        poll = Poll.objects.get(id=self.poll_id)
        user = CustomUser.objects.get(username=username)

        return ChatMessage.objects.create(
            poll=poll,
            user=user,
            content=text
        )
