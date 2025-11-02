"""
API Views for Papers and Categories
"""

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny

from .models import Category
from .serializers import (
    CategorySerializer,
    CategoryListSerializer,
    CategoryTreeSerializer,
    CategoryCreateUpdateSerializer
)
from .services import CategoryService


class CategoryListView(APIView):
    """
    GET: List all root categories
    POST: Create a new category (admin only)
    """
    permission_classes = [AllowAny]
    
    def get(self, request):
        """Get all root categories"""
        categories = CategoryService.get_all_categories()
        serializer = CategoryListSerializer(categories, many=True)
        return Response({
            'success': True,
            'data': serializer.data,
            'count': categories.count()
        }, status=status.HTTP_200_OK)
    
    def post(self, request):
        """Create a new category (admin only)"""
        # TODO: Add IsAdminUser permission
        serializer = CategoryCreateUpdateSerializer(data=request.data)
        
        if serializer.is_valid():
            category = CategoryService.create_category(serializer.validated_data)
            response_serializer = CategorySerializer(category)
            return Response({
                'success': True,
                'message': 'Category created successfully',
                'data': response_serializer.data
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class CategoryDetailView(APIView):
    """
    GET: Retrieve category details
    PUT: Update category (admin only)
    DELETE: Delete category (admin only)
    """
    permission_classes = [AllowAny]
    
    def get(self, request, category_id):
        """Get category by ID"""
        category = CategoryService.get_category_by_id(category_id)
        
        if not category:
            return Response({
                'success': False,
                'message': 'Category not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        serializer = CategorySerializer(category)
        return Response({
            'success': True,
            'data': serializer.data
        }, status=status.HTTP_200_OK)
    
    def put(self, request, category_id):
        """Update category (admin only)"""
        # TODO: Add IsAdminUser permission
        category = CategoryService.get_category_by_id(category_id)
        
        if not category:
            return Response({
                'success': False,
                'message': 'Category not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        serializer = CategoryCreateUpdateSerializer(
            category,
            data=request.data,
            partial=True
        )
        
        if serializer.is_valid():
            updated_category = CategoryService.update_category(
                category,
                serializer.validated_data
            )
            response_serializer = CategorySerializer(updated_category)
            return Response({
                'success': True,
                'message': 'Category updated successfully',
                'data': response_serializer.data
            }, status=status.HTTP_200_OK)
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, category_id):
        """Soft delete category (admin only)"""
        # TODO: Add IsAdminUser permission
        category = CategoryService.get_category_by_id(category_id)
        
        if not category:
            return Response({
                'success': False,
                'message': 'Category not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        CategoryService.delete_category(category)
        return Response({
            'success': True,
            'message': 'Category deleted successfully'
        }, status=status.HTTP_200_OK)


class CategoryTreeView(APIView):
    """
    GET: Retrieve complete category tree structure
    """
    permission_classes = [AllowAny]
    
    def get(self, request):
        """Get category tree"""
        categories = CategoryService.get_category_tree()
        serializer = CategoryTreeSerializer(categories, many=True)
        return Response({
            'success': True,
            'data': serializer.data
        }, status=status.HTTP_200_OK)


class CategorySubcategoriesView(APIView):
    """
    GET: Get all subcategories of a parent category
    """
    permission_classes = [AllowAny]
    
    def get(self, request, category_id):
        """Get subcategories"""
        # Check if parent exists
        parent = CategoryService.get_category_by_id(category_id)
        if not parent:
            return Response({
                'success': False,
                'message': 'Parent category not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        subcategories = CategoryService.get_subcategories(category_id)
        serializer = CategoryListSerializer(subcategories, many=True)
        return Response({
            'success': True,
            'data': serializer.data,
            'count': subcategories.count()
        }, status=status.HTTP_200_OK)


class CategorySearchView(APIView):
    """
    GET: Search categories by name or description
    """
    permission_classes = [AllowAny]
    
    def get(self, request):
        """Search categories"""
        query = request.query_params.get('q', '')
        
        if not query or len(query) < 2:
            return Response({
                'success': False,
                'message': 'Search query must be at least 2 characters'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        categories = CategoryService.search_categories(query)
        serializer = CategoryListSerializer(categories, many=True)
        
        return Response({
            'success': True,
            'data': serializer.data,
            'count': categories.count()
        }, status=status.HTTP_200_OK)

