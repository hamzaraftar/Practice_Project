
from rest_framework import generics, status
from rest_framework.response import Response
from .models import Poll, Option, Vote
from .serializers import PollSerializer, OptionSerializer, VoteSerializer

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
        option = Option.objects.get(id=option_id)
        Vote.objects.create(option=option)
        return Response({'message': 'Vote counted!'}, status=status.HTTP_201_CREATED)
