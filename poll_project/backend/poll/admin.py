from django.contrib import admin
from .models import Poll, Option, Vote , CustomUser


@admin.register(Poll)
class PollAdmin(admin.ModelAdmin):
    list_display = ('id', 'question', 'created_at')

@admin.register(Option)
class OptionAdmin(admin.ModelAdmin):
    list_display = ('id', 'text', 'poll')


@admin.register(Vote)
class VoteAdmin(admin.ModelAdmin):
    list_display = ('id', 'option', 'created_at')

@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ('id', 'username', 'email', 'is_staff')