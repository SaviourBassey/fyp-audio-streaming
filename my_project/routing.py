from channels.routing import ProtocolTypeRouter, URLRouter
from django.urls import path
from django.core.asgi import get_asgi_application

from home import consumers

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    'websocket': URLRouter([
        path('ws/signal/<str:room_name>/', consumers.SignalingConsumer.as_asgi()),
    ]),
})
