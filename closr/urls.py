from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('core.urls')),
    path('api/auth/', include('authentication.urls')),
    path('api/customers/', include('customers.urls')),
    path('api/conversations/', include('conversations.urls')),
    path('api/knowledge/', include('knowledge.urls')),
    path('api/appointments/', include('appointments.urls')),
    path('api/tickets/', include('tickets.urls')),
    path('api/crm/', include('crm.urls')),
    path('api/agent/', include('agent.urls')),
]
