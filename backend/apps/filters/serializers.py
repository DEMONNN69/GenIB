"""
Serializers for Filter Types and Options
"""

from rest_framework import serializers
from .models import FilterType, FilterOption


class FilterOptionSerializer(serializers.ModelSerializer):
    """
    Serializer for Filter Options
    """
    full_path = serializers.CharField(read_only=True)
    has_children = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = FilterOption
        fields = [
            'id',
            'name',
            'code',
            'slug',
            'description',
            'parent',
            'display_order',
            'icon',
            'color',
            'is_active',
            'is_featured',
            'full_path',
            'has_children',
        ]
        read_only_fields = ['id', 'slug']


class FilterTypeSerializer(serializers.ModelSerializer):
    """
    Serializer for Filter Types with nested options
    """
    option_count = serializers.IntegerField(read_only=True)
    options = FilterOptionSerializer(many=True, read_only=True)
    
    class Meta:
        model = FilterType
        fields = [
            'id',
            'name',
            'slug',
            'description',
            'is_required',
            'is_hierarchical',
            'allow_multiple',
            'display_order',
            'is_active',
            'show_in_frontend',
            'option_count',
            'options',
        ]
        read_only_fields = ['id', 'slug']


class FilterTypeListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for listing filter types without options
    """
    option_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = FilterType
        fields = [
            'id',
            'name',
            'slug',
            'description',
            'is_required',
            'display_order',
            'is_active',
            'show_in_frontend',
            'option_count',
        ]
