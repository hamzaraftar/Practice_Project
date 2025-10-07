
from django.contrib import admin
from django.urls import path
from app import views   

urlpatterns = [
    path('admin/', admin.site.urls),
    path('todos/', views.TodoAPI.as_view()),
    path('todos/<int:id>/', views.TodoAPI.as_view()),
]
