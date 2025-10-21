
from rest_framework import generics, status
from rest_framework.response import Response
from .models import Poll, Option, Vote
from .serializers import PollSerializer, OptionSerializer, VoteSerializer
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
class PollListCreateView(generics.ListCreateAPIView):
    queryset = Poll.objects.all()
    serializer_class = PollSerializer

    def create(self, request, *args, **kwargs):
        question = request.data.get('question')
        options = request.data.get('options', [])

        poll = Poll.objects.create(question=question)
        for text in options:
            Option.objects.create(poll=poll, text=text)

        return Response(PollSerializer(poll).data, status=status.HTTP_201_CREATED)





class PollDetailView(generics.RetrieveDestroyAPIView): 
    queryset = Poll.objects.all()
    serializer_class = PollSerializer

    def delete(self, request, *args, **kwargs):
        poll = self.get_object()
        poll.delete()
        return Response({"message": "Poll deleted successfully!"}, status=status.HTTP_204_NO_CONTENT)



class VoteCreateView(generics.CreateAPIView):
    serializer_class = VoteSerializer

    def create(self, request, *args, **kwargs):
        option_id = request.data.get('option')
        try:
            option = Option.objects.get(id=option_id)
        except Option.DoesNotExist:
            return Response({'error': 'Option not found'}, status=status.HTTP_404_NOT_FOUND)

        # Save the vote
        Vote.objects.create(option=option)

        # Update the vote count
        option.votes_count = option.votes.count()
        option.save()

        # Get the poll related to this option
        poll = option.poll

        # Prepare poll data to send via WebSocket
        poll_data = {
            "id": poll.id,
            "question": poll.question,
            "options": [
                {"id": opt.id, "text": opt.text, "votes_count": opt.votes_count}
                for opt in poll.options.all()
            ]
        }

        # 🔥 Send updated poll data to WebSocket group
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f'poll_{poll.id}',
            {
                'type': 'poll_message',
                'message': poll_data
            }
        )

        return Response({'message': 'Vote counted!', 'poll': poll_data}, status=status.HTTP_201_CREATED)