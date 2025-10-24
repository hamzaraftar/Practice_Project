from django.urls import path
from .views import PollListCreateView, PollDeleteView, VoteCreateView, PollDetailView ,ChatMessageView

urlpatterns = [
    path('polls/', PollListCreateView.as_view(), name='poll-list-create'),

    path('polls/<int:pk>/detail/', PollDetailView.as_view(), name='poll-detail'),

    path('chat/messages/<int:poll_id>/', ChatMessageView.as_view(), name='chat-messages'),

    path('polls/<int:pk>/delete/', PollDeleteView.as_view(), name='poll-delete'),

    path('vote/', VoteCreateView.as_view(), name='vote-create'),
]
