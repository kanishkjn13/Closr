from django.urls import path
from .views import (
    HealthCheckView,
    DatabaseHealthCheckView,
    AuditLogListView,
    AnalyticsDashboardView,
)

urlpatterns = [
    path('health/', HealthCheckView.as_view(), name='health-check'),
    path('health/db/', DatabaseHealthCheckView.as_view(), name='database-health-check'),
    path('analytics/dashboard/', AnalyticsDashboardView.as_view(), name='analytics-dashboard'),
    path('analytics/audit-logs/', AuditLogListView.as_view(), name='audit-logs-list'),
]
