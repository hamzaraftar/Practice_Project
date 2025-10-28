from rest_framework import serializers
from .models import Poll, Option, Vote,ChatMessage

class OptionSerializer(serializers.ModelSerializer):
    votes_count = serializers.IntegerField(source='votes.count', read_only=True)
    class Meta:
        model = Option
        fields = ['id', 'text', 'votes_count']

class PollSerializer(serializers.ModelSerializer):
    options = OptionSerializer(many=True, read_only=True)
    class Meta:
        model = Poll
        fields = ['id', 'question', 'created_at', 'options']

class VoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vote
        fields = ['id', 'option']

