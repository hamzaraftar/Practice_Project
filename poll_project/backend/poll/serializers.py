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
    created_by = serializers.SerializerMethodField()

    class Meta:
        model = Poll
        fields = ['id', 'question', 'created_at', 'created_by', 'options']

    def get_created_by(self, obj):       
        return obj.created_by.username if obj.created_by else "Unknown"
    
    
class VoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vote
        fields = ['id', 'option']


User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(write_only=True)
    email = serializers.EmailField(required=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2', 'is_admin', 'is_regular']
        extra_kwargs = {'password': {'write_only': True}}

    def validate(self, attrs):
        # Password match validation
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"error": "Passwords do not match"})

        #  Make sure one of them is true (or default)
        if attrs.get('is_admin') and attrs.get('is_regular'):
            raise serializers.ValidationError({"error": "User cannot be both admin and regular."})

        return attrs

    def create(self, validated_data):
        password = validated_data.pop('password')
        validated_data.pop('password2')

        #Extract roles safely
        is_admin = validated_data.pop('is_admin', False)
        is_regular = validated_data.pop('is_regular', True)

        #Always ensure one role is true
        if is_admin:
            is_regular = False
        else:
            is_regular = True

        # Create user instance
        user = User(**validated_data)
        user.set_password(password)
        user.is_admin = is_admin
        user.is_regular = is_regular

        # Mark admin as staff for permission classes
        user.is_staff = is_admin
        user.save()

        return user
