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
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'password', 'password2', 'is_admin', 'is_regular']
        extra_kwargs = {'password': {'write_only': True}}

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"error": "Passwords do not match"})
        return attrs

    def create(self, validated_data):
        password = validated_data.pop('password')
        validated_data.pop('password2')

        # ✅ explicitly get is_admin and is_regular
        is_admin = validated_data.pop('is_admin', False)
        is_regular = validated_data.pop('is_regular', True)

        user = User(**validated_data)
        user.set_password(password)
        user.is_admin = is_admin
        user.is_regular = is_regular

        # ✅ if you also have user.is_staff for admin
        if is_admin:
            user.is_staff = True

        user.save()
        return user