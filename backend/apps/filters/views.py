"""
API Views for Filter Types and Options
"""

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from .models import FilterType, FilterOption
from .serializers import (
    FilterTypeSerializer,
    FilterTypeListSerializer,
    FilterOptionSerializer
)


class FilterTypeListView(APIView):
    """
    GET: List all active filter types with their options
    This is the main endpoint for frontend filters
    """
    permission_classes = [AllowAny]
    
    def get(self, request):
        """Get all active filter types with options"""
        filter_types = FilterType.objects.filter(
            is_active=True
        ).prefetch_related('options').order_by('display_order', 'name')
        
        serializer = FilterTypeSerializer(filter_types, many=True)
        return Response({
            'success': True,
            'data': serializer.data,
            'count': filter_types.count()
        }, status=status.HTTP_200_OK)


class FilterTypeDetailView(APIView):
    """
    GET: Retrieve a single filter type with its options
    """
    permission_classes = [AllowAny]
    
    def get(self, request, type_id):
        """Get filter type by ID"""
        try:
            filter_type = FilterType.objects.prefetch_related('options').get(
                id=type_id,
                is_active=True
            )
        except FilterType.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Filter type not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        serializer = FilterTypeSerializer(filter_type)
        return Response({
            'success': True,
            'data': serializer.data
        }, status=status.HTTP_200_OK)


class FilterTypeBySlugView(APIView):
    """
    GET: Retrieve filter type by slug with options
    """
    permission_classes = [AllowAny]
    
    def get(self, request, slug):
        """Get filter type by slug"""
        try:
            filter_type = FilterType.objects.prefetch_related('options').get(
                slug=slug,
                is_active=True
            )
        except FilterType.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Filter type not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        serializer = FilterTypeSerializer(filter_type)
        return Response({
            'success': True,
            'data': serializer.data
        }, status=status.HTTP_200_OK)


class FilterOptionSearchView(APIView):
    """
    GET: Search filter options across all types
    """
    permission_classes = [AllowAny]
    
    def get(self, request):
        """Search filter options"""
        query = request.query_params.get('q', '')
        
        if not query or len(query) < 2:
            return Response({
                'success': False,
                'message': 'Search query must be at least 2 characters'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        options = FilterOption.objects.filter(
            name__icontains=query,
            is_active=True
        ).select_related('filter_type').order_by('filter_type__display_order', 'display_order')
        
        serializer = FilterOptionSerializer(options, many=True)
        return Response({
            'success': True,
            'data': serializer.data,
            'count': options.count()
        }, status=status.HTTP_200_OK)

