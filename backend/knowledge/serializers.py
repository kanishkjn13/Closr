from rest_framework import serializers
from .models import KnowledgeArticle


class KnowledgeArticleSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.username', read_only=True)

    class Meta:
        model = KnowledgeArticle
        fields = [
            'id',
            'title',
            'slug',
            'content',
            'category',
            'status',
            'author',
            'author_name',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']
