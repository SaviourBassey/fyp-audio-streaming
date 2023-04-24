import json
from channels.generic.websocket import AsyncWebsocketConsumer



class SignalingConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'sound_capture_{self.room_name}'

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'signal_message',
                'message': text_data_json,
                'from': self.channel_name,
            }
        )

    async def signal_message(self, event):
        message = event['message']
        message['from'] = event['from']
        # Don't send the message back to the sender
        if self.channel_name != message['from']:
            await self.send(text_data=json.dumps(message))