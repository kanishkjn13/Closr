from django.db.models import Q
from rest_framework import generics, status, filters
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import KnowledgeArticle
from .serializers import KnowledgeArticleSerializer
from core.models import AuditLog


class KnowledgeArticleListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = KnowledgeArticleSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'content', 'category']
    ordering_fields = ['title', 'created_at', 'updated_at', 'category']
    ordering = ['-updated_at']

    def get_queryset(self):
        qs = KnowledgeArticle.objects.select_related('author').all()
        status_param = self.request.query_params.get('status')
        if status_param:
            qs = qs.filter(status=status_param)

        category_param = self.request.query_params.get('category')
        if category_param:
            qs = qs.filter(category=category_param)

        return qs

    def perform_create(self, serializer):
        article = serializer.save(author=self.request.user)
        AuditLog.objects.create(
            actor=self.request.user,
            action='CREATE',
            resource_type='KnowledgeArticle',
            resource_id=str(article.id),
            outcome='success',
            metadata={'title': article.title, 'category': article.category},
        )


class KnowledgeArticleDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = KnowledgeArticleSerializer
    queryset = KnowledgeArticle.objects.select_related('author').all()

    def perform_update(self, serializer):
        article = serializer.save()
        AuditLog.objects.create(
            actor=self.request.user,
            action='UPDATE',
            resource_type='KnowledgeArticle',
            resource_id=str(article.id),
            outcome='success',
            metadata={'title': article.title},
        )


class KnowledgeSearchAPIView(APIView):
    """
    Search published knowledge base articles for AI grounding and agent inquiry.
    """
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        query = request.query_params.get('q', '').strip()
        category = request.query_params.get('category', '').strip()

        qs = KnowledgeArticle.objects.filter(status='published')
        if category:
            qs = qs.filter(category__iexact=category)

        if query:
            qs = qs.filter(Q(title__icontains=query) | Q(content__icontains=query))

        articles = qs[:10]
        serializer = KnowledgeArticleSerializer(articles, many=True)
        return Response(
            {
                "success": True,
                "count": articles.count(),
                "query": query,
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )
