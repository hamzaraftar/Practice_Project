from rest_framework import serializers
from .models import Poll, Option, Vote
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password



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


User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('username', 'password', 'password2', 'is_admin', 'is_regular')

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Passwords didn't match."})
        return attrs

    def create(self, validated_data):
        user = User(
            username=validated_data['username'],
            is_admin=validated_data.get('is_admin', False),
            is_regular=validated_data.get('is_regular', True),
        )
        user.set_password(validated_data['password'])
        user.save()
        return user