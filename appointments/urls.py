from django.urls import path
from .views import (
    AppointmentListCreateView,
    AppointmentDetailView,
    AppointmentAvailabilityView,
    RescheduleAppointmentView,
    CancelAppointmentView,
)

urlpatterns = [
    path('', AppointmentListCreateView.as_view(), name='appointment-list-create'),
    path('availability/', AppointmentAvailabilityView.as_view(), name='appointment-availability'),
    path('<int:pk>/', AppointmentDetailView.as_view(), name='appointment-detail'),
    path('<int:pk>/reschedule/', RescheduleAppointmentView.as_view(), name='appointment-reschedule'),
    path('<int:pk>/cancel/', CancelAppointmentView.as_view(), name='appointment-cancel'),
]
