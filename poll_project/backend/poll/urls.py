from django.urls import path
from .views import PollListCreateView, PollDetailView, VoteCreateView, PollDetailView

urlpatterns = [
    path('polls/', PollListCreateView.as_view(), name='poll-list-create'),
    path('polls/<int:pk>/', PollDetailView.as_view(), name='poll-detail'),
    path('polls/<int:pk>/', PollDetailView.as_view(), name='poll-detail'),
    path('vote/', VoteCreateView.as_view(), name='vote-create'),
]
