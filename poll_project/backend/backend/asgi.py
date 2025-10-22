import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import poll.routing  # ✅ correct for your app name

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')  # ✅ your project name

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            poll.routing.websocket_urlpatterns
        )
    ),
})
