from django.urls import path
from .views import (
    KnowledgeArticleListCreateView,
    KnowledgeArticleDetailView,
    KnowledgeSearchAPIView,
)

urlpatterns = [
    path('', KnowledgeArticleListCreateView.as_view(), name='knowledge-list-create'),
    path('search/', KnowledgeSearchAPIView.as_view(), name='knowledge-search'),
    path('<int:pk>/', KnowledgeArticleDetailView.as_view(), name='knowledge-detail'),
]
