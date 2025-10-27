from django.db import models

class Poll(models.Model):
    question = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)


class Option(models.Model):
    poll = models.ForeignKey(Poll, related_name='options', on_delete=models.CASCADE)
    text = models.CharField(max_length=100)


class Vote(models.Model):
    option = models.ForeignKey(Option, related_name='votes', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

# for chat functionality
class ChatMessage(models.Model):
    poll = models.ForeignKey(Poll, on_delete=models.CASCADE, related_name="messages")
    user = models.CharField(max_length=100)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
