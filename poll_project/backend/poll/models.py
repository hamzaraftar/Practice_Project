from django.db import models
from django.contrib.auth.models import AbstractUser

# Custom user model to differentiate between admin and regular users
class CustomUser(AbstractUser):
    is_admin = models.BooleanField(default=False)
    is_regular = models.BooleanField(default=True)

# Poll model representing a poll with a question and options
class Poll(models.Model):
    question = models.CharField(max_length=255)
    created_by = models.ForeignKey( CustomUser,on_delete=models.CASCADE,related_name='polls')
    created_at = models.DateTimeField(auto_now_add=True)    

# Option model representing an option in a poll
class Option(models.Model):
    poll = models.ForeignKey(Poll, related_name='options', on_delete=models.CASCADE)
    text = models.CharField(max_length=100)

# Vote model representing a vote for an option in a poll
class Vote(models.Model):
    option = models.ForeignKey(Option, related_name='votes', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

# ChatMessage model representing messages in a poll's chat
class ChatMessage(models.Model):
    poll = models.ForeignKey(Poll, on_delete=models.CASCADE, related_name="messages")
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
