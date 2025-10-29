from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import generics
from django.contrib.auth import get_user_model
from .models import Poll, Option, ChatMessage
from .serializers import PollSerializer, VoteSerializer, RegisterSerializer
from .permissions import IsAdminUserCustom, IsAuthenticatedUser
from rest_framework.permissions import IsAuthenticated, AllowAny


# 🗳 For listing and creating polls
class PollListCreateView(APIView):
    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]  # anyone can view polls
        return [IsAuthenticated()]  # only logged-in users can create (we'll check admin next)

    def get(self, request):
        polls = Poll.objects.all()
        serializer = PollSerializer(polls, many=True)
        return Response(serializer.data)

    def post(self, request):
        # Check if user is admin
        if not request.user.is_staff:
            return Response(
                {"error": "You do not have permission to create polls."},
                status=status.HTTP_403_FORBIDDEN
            )

        question = request.data.get('question')
        options = request.data.get('options', [])

        if not question or not options:
            return Response(
                {"error": "Question and options are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        poll = Poll.objects.create(question=question)
        for text in options:
            Option.objects.create(poll=poll, text=text)

        serializer = PollSerializer(poll)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


# 🧾 For retrieving poll details
class PollDetailView(APIView):
    permission_classes = [IsAuthenticatedUser]

    def get(self, request, pk):
        try:
            poll = Poll.objects.get(pk=pk)
        except Poll.DoesNotExist:
            return Response({"error": f"Poll with id {pk} was not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = PollSerializer(poll)
        return Response(serializer.data)


# ❌ For deleting a poll
class PollDeleteView(APIView):
    permission_classes = [IsAdminUserCustom]

    def delete(self, request, pk):
        # Check permissions (DRF handles this automatically, but we’ll be explicit)
        if not request.user.is_authenticated:
            return Response(
                {"error": "Authentication required. Please log in."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        if not request.user.is_staff:
            return Response(
                {"error": "You do not have permission to delete polls."},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            poll = Poll.objects.get(pk=pk)
        except Poll.DoesNotExist:
            return Response(
                {"error": f"Poll with id {pk} was not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        poll.delete()
        return Response(
            {"message": f"Poll with id {pk} has been successfully deleted."},
            status=status.HTTP_204_NO_CONTENT
        )    

# ✅ For creating votes (any authenticated user can vote)
class VoteCreateView(APIView):
    permission_classes = [IsAuthenticatedUser]

    def post(self, request):
        serializer = VoteSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# 💬 For chat messages
class ChatMessageView(APIView):
    permission_classes = [IsAuthenticatedUser]

    def get(self, request, poll_id):
        try:
            poll = Poll.objects.get(id=poll_id)
        except Poll.DoesNotExist:
            return Response({"error": "Poll not found"}, status=status.HTTP_404_NOT_FOUND)

        messages = ChatMessage.objects.filter(poll=poll).order_by('timestamp')
        serialized_messages = [
            {
                "user": msg.user,
                "text": msg.content,
                "timestamp": msg.timestamp
            } for msg in messages
        ]
        return Response(serialized_messages)

    def post(self, request, poll_id):
        user = request.user.username  # ✅ use authenticated user instead of request.data["user"]
        text = request.data.get("text")

        if not text:
            return Response(
                {"error": "Text is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            poll = Poll.objects.get(id=poll_id)
        except Poll.DoesNotExist:
            return Response({"error": "Poll not found"}, status=status.HTTP_404_NOT_FOUND)

        chat_message = ChatMessage.objects.create(poll=poll, user=user, content=text)
        serialized_message = {
            "user": chat_message.user,
            "text": chat_message.content,
            "timestamp": chat_message.timestamp
        }
        return Response(serialized_message, status=status.HTTP_201_CREATED)
    

# 👤 Register view
User = get_user_model()
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
