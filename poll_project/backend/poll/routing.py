from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    # Global updates (create/delete polls)
    re_path(r"ws/polls/$", consumers.GlobalPollConsumer.as_asgi()),

    # Chat & vote updates for a specific poll
    re_path(r"ws/chat/(?P<poll_id>\d+)/$", consumers.PollConsumer.as_asgi()),
]
