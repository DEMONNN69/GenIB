"""
Business logic for Papers and Categories
"""

from django.db.models import Q, Count
from .models import Category


class CategoryService:
    """Service for Category operations"""
    
    @staticmethod
    def get_all_categories(include_inactive=False):
        """Get all root categories (no parent)"""
        queryset = Category.objects.filter(parent__isnull=True)
        if not include_inactive:
            queryset = queryset.filter(is_active=True)
        return queryset.order_by('display_order', 'name')
    
    @staticmethod
    def get_category_by_id(category_id):
        """Get category by ID"""
        try:
            return Category.objects.get(id=category_id, is_active=True)
        except Category.DoesNotExist:
            return None
    
    @staticmethod
    def get_category_by_slug(slug):
        """Get category by slug"""
        try:
            return Category.objects.get(slug=slug, is_active=True)
        except Category.DoesNotExist:
            return None
    
    @staticmethod
    def get_subcategories(parent_id):
        """Get all subcategories of a parent category"""
        return Category.objects.filter(
            parent_id=parent_id,
            is_active=True
        ).order_by('display_order', 'name')
    
    @staticmethod
    def get_category_tree():
        """Get complete category tree structure"""
        return Category.objects.filter(
            parent__isnull=True,
            is_active=True
        ).prefetch_related('subcategories').order_by('display_order', 'name')
    
    @staticmethod
    def search_categories(query):
        """Search categories by name or description"""
        return Category.objects.filter(
            Q(name__icontains=query) | Q(description__icontains=query),
            is_active=True
        ).order_by('display_order', 'name')
    
    @staticmethod
    def create_category(data):
        """Create a new category"""
        category = Category.objects.create(**data)
        return category
    
    @staticmethod
    def update_category(category, data):
        """Update an existing category"""
        for key, value in data.items():
            setattr(category, key, value)
        category.save()
        return category
    
    @staticmethod
    def delete_category(category):
        """Soft delete a category"""
        category.is_active = False
        category.save()
        return category
    
    @staticmethod
    def get_main_categories():
        """Get only main/featured categories"""
        return Category.objects.filter(
            is_main=True,
            is_active=True
        ).order_by('display_order', 'name')
