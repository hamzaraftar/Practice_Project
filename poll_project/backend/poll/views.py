from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import generics
from django.contrib.auth import get_user_model
from .models import Poll, Option, ChatMessage
from .serializers import PollSerializer, VoteSerializer, RegisterSerializer
from .permissions import IsAdminUserCustom, IsAuthenticatedUser
from rest_framework.permissions import IsAuthenticated, AllowAny


#For listing and creating polls
class PollListCreateView(APIView):
    """
    GET: Anyone can view polls
    POST: Only admins (is_staff or is_admin=True) can create polls
    """

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]  # anyone can view polls
        return [IsAuthenticated()]  # must be logged in to create polls

    def get(self, request):
        polls = Poll.objects.all().order_by('-created_at')
        serializer = PollSerializer(polls, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        user = request.user

        # Debug info for server console
        print(f"DEBUG USER -> username: {user.username}, is_staff: {user.is_staff}, is_admin: {getattr(user, 'is_admin', None)}")

        # Check admin permissions
        if not (user.is_staff or getattr(user, 'is_admin', False)):
            return Response(
                {"error": "You do not have permission to create polls. Only admins can create polls."},
                status=status.HTTP_403_FORBIDDEN
            )

        question = request.data.get('question')
        options = request.data.get('options', [])

        # Validate data
        if not question:
            return Response({"error": "Question field is required."}, status=status.HTTP_400_BAD_REQUEST)
        if not options or not isinstance(options, list):
            return Response({"error": "Options must be a list of strings."}, status=status.HTTP_400_BAD_REQUEST)

        # ✅ Create poll and link to current admin user
        poll = Poll.objects.create(question=question, created_by=user)

        # Create related options
        for text in options:
            Option.objects.create(poll=poll, text=text)

        serializer = PollSerializer(poll)
        return Response(
            {"message": "Poll created successfully.", "poll": serializer.data},
            status=status.HTTP_201_CREATED
        )

#For retrieving poll details
class PollDetailView(APIView):
    permission_classes = [IsAuthenticatedUser]

    def get(self, request, pk):
        try:
            poll = Poll.objects.get(pk=pk)
        except Poll.DoesNotExist:
            return Response({"error": f"Poll with id {pk} was not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = PollSerializer(poll)
        return Response(serializer.data)


#For deleting a poll
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

# For creating votes (any authenticated user can vote)
class VoteCreateView(APIView):
    permission_classes = [IsAuthenticatedUser]

    def post(self, request):
        serializer = VoteSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


#  For chat messages
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
        user = request.user.username  # use authenticated user instead of request.data["user"]
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



class UserDetailView(APIView):
    permission_classes = [IsAuthenticated]  # Only logged-in users can access

    def get(self, request):
        user = request.user
        return Response({
            "username": user.username,
            "is_admin": getattr(user, "is_admin", False),
            "is_regular": getattr(user, "is_regular", False),
            "is_staff": user.is_staff,  # optional: for Django admin check
        })