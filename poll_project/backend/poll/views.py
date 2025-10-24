
from rest_framework import  status
from rest_framework.response import Response
from .models import Poll, Option, ChatMessage
from .serializers import PollSerializer, VoteSerializer
from rest_framework.views import APIView

# for listing and creating polls
class PollListCreateView(APIView):
    def get(self, request):        
        polls = Poll.objects.all()
        serializer = PollSerializer(polls, many=True)
        return Response(serializer.data)

    def post(self, request):        
        question = request.data.get('question')
        options = request.data.get('options', [])

        if not question and not options:
            return Response(
                {"error": "Question and options are required"},
                status=status.HTTP_400_BAD_REQUEST
            )
       
        poll = Poll.objects.create(question=question)

        for text in options:
            Option.objects.create(poll=poll, text=text)
        
        serializer = PollSerializer(poll)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

# for retrieving poll details
class PollDetailView(APIView):
    def get(self, request, pk):
        try:
            poll = Poll.objects.get(pk=pk)
        except Poll.DoesNotExist:
            return Response({"error": f"Poll with id {pk} was not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = PollSerializer(poll)
        return Response(serializer.data)

# for deleting a poll
class PollDeleteView(APIView):
    def delete(self, request, pk):
        try:
            poll = Poll.objects.get(pk=pk)
        except Poll.DoesNotExist:
            return Response({"error": f"Poll with id {pk} was not found."},status=status.HTTP_404_NOT_FOUND)

        poll.delete()
        return Response({"message": f"Poll with id {pk} has been successfully deleted."}, status=status.HTTP_204_NO_CONTENT)
    
# for creating votes
class VoteCreateView(APIView):
    def post(self, request):
        serializer = VoteSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)        
    

class ChatMessageView(APIView):
    def get(self, request, poll_id):
        try:
            poll = Poll.objects.get(id=poll_id)
        except Poll.DoesNotExist:
            return Response({"error": "Poll not found."}, status=status.HTTP_404_NOT_FOUND)

        messages = ChatMessage.objects.filter(poll=poll).order_by('timestamp')
        serialized_messages = [
            {
                'username': msg.username,
                'message': msg.message,
                'timestamp': msg.timestamp
            } for msg in messages
        ]
        return Response(serialized_messages)

    def post(self, request, poll_id):
        try:
            poll = Poll.objects.get(id=poll_id)
        except Poll.DoesNotExist:
            return Response({"error": "Poll not found."}, status=status.HTTP_404_NOT_FOUND)

        username = request.data.get('username')
        message = request.data.get('message')

        if not username or not message:
            return Response(
                {"error": "Username and message are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        chat_message = ChatMessage.objects.create(
            poll=poll,
            username=username,
            message=message
        )

        serialized_message = {
            'username': chat_message.username,
            'message': chat_message.message,
            'timestamp': chat_message.timestamp
        }
        return Response(serialized_message, status=status.HTTP_201_CREATED)