from django.urls import path
from .views import PollListCreateView, PollDeleteView, VoteCreateView, PollDetailView ,ChatMessageView, RegisterView
from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [

    path('register/', RegisterView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    path('polls/', PollListCreateView.as_view(), name='poll-list-create'),

    path('polls/<int:pk>/detail/', PollDetailView.as_view(), name='poll-detail'),

    path('chat/messages/<int:poll_id>/', ChatMessageView.as_view(), name='chat_messages'),

    path('polls/<int:pk>/delete/', PollDeleteView.as_view(), name='poll-delete'),

    path('vote/', VoteCreateView.as_view(), name='vote-create'),
]
