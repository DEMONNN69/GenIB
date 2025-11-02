"""
Serializers for Papers and Categories
"""

from rest_framework import serializers
from .models import Category


class CategorySerializer(serializers.ModelSerializer):
    """
    Full serializer for Category with all details
    """
    paper_count = serializers.IntegerField(read_only=True)
    full_path = serializers.CharField(read_only=True)
    is_subcategory = serializers.BooleanField(read_only=True)
    subcategories_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = [
            'id',
            'name',
            'slug',
            'description',
            'icon',
            'parent',
            'is_free',
            'is_downloadable',
            'is_online',
            'is_printable',
            'is_main',
            'display_order',
            'is_active',
            'paper_count',
            'full_path',
            'is_subcategory',
            'subcategories_count',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']
    
    def get_subcategories_count(self, obj):
        """Get count of direct subcategories"""
        return obj.subcategories.filter(is_active=True).count()


class CategoryListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for listing categories
    """
    paper_count = serializers.IntegerField(read_only=True)
    subcategories_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = [
            'id',
            'name',
            'slug',
            'description',
            'icon',
            'is_free',
            'is_downloadable',
            'is_online',
            'is_printable',
            'is_main',
            'display_order',
            'paper_count',
            'subcategories_count',
        ]
    
    def get_subcategories_count(self, obj):
        """Get count of direct subcategories"""
        return obj.subcategories.filter(is_active=True).count()


class CategoryTreeSerializer(serializers.ModelSerializer):
    """
    Nested serializer for category tree structure
    """
    subcategories = serializers.SerializerMethodField()
    paper_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Category
        fields = [
            'id',
            'name',
            'slug',
            'description',
            'icon',
            'is_free',
            'is_downloadable',
            'is_online',
            'is_printable',
            'is_main',
            'display_order',
            'paper_count',
            'subcategories',
        ]
    
    def get_subcategories(self, obj):
        """Recursively serialize subcategories"""
        subcats = obj.subcategories.filter(is_active=True)
        return CategoryTreeSerializer(subcats, many=True).data


class CategoryCreateUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating/updating categories
    """
    
    class Meta:
        model = Category
        fields = [
            'name',
            'description',
            'icon',
            'parent',
            'is_free',
            'is_downloadable',
            'is_online',
            'is_printable',
            'is_main',
            'display_order',
            'is_active',
        ]
    
    def validate_parent(self, value):
        """Ensure parent is not self and prevent circular references"""
        if self.instance and value:
            if value == self.instance:
                raise serializers.ValidationError("Category cannot be its own parent")
            
            # Check for circular reference
            current = value
            while current.parent:
                if current.parent == self.instance:
                    raise serializers.ValidationError("Circular parent reference detected")
                current = current.parent
        
        return value
