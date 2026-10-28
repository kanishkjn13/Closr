from django.urls import path
from .views import (
    SupportTicketListCreateView,
    SupportTicketDetailView,
    TicketEscalateView,
)

urlpatterns = [
    path('', SupportTicketListCreateView.as_view(), name='ticket-list-create'),
    path('<int:pk>/', SupportTicketDetailView.as_view(), name='ticket-detail'),
    path('<int:pk>/escalate/', TicketEscalateView.as_view(), name='ticket-escalate'),
]
