from django.urls import path
from .views import AIChatView, AIToolRegistryView

urlpatterns = [
    path('chat/', AIChatView.as_view(), name='agent-chat'),
    path('tools/', AIToolRegistryView.as_view(), name='agent-tools'),
]
