"""
API Views for Papers and Categories
"""

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Q

from .models import Category, Paper
from .serializers import (
    CategorySerializer,
    CategoryListSerializer,
    CategoryTreeSerializer,
    CategoryCreateUpdateSerializer,
    PaperListSerializer,
    PaperDetailSerializer,
)
from .services import CategoryService
from django.http import FileResponse, Http404
from django.conf import settings
from django.utils.decorators import method_decorator
from django.views.decorators.clickjacking import xframe_options_exempt


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


class PaperListView(APIView):
    """
    GET: List all papers with optional filtering
    POST: Create a new paper (admin only)
    """
    permission_classes = [AllowAny]
    
    def get(self, request):
        """Get all papers with optional filters"""
        papers = Paper.objects.filter(is_active=True).select_related('category').prefetch_related('filters')
        
        # Filter by category
        category_slug = request.query_params.get('category')
        if category_slug:
            papers = papers.filter(category__slug=category_slug)
        
        # Filter by filter options (dynamic filters)
        filter_slugs = request.query_params.getlist('filter')  # Can pass multiple: ?filter=ib-diploma&filter=mathematics
        if filter_slugs:
            for filter_slug in filter_slugs:
                papers = papers.filter(filters__slug=filter_slug)
        
        # Search by title
        search = request.query_params.get('search')
        if search:
            papers = papers.filter(
                Q(title__icontains=search) | Q(description__icontains=search)
            )
        
        # Filter by featured
        featured = request.query_params.get('featured')
        if featured and featured.lower() == 'true':
            papers = papers.filter(is_featured=True)
        
        # Filter by free/premium
        is_free = request.query_params.get('free')
        if is_free and is_free.lower() == 'true':
            papers = papers.filter(is_free=True)
        
        # Ordering
        ordering = request.query_params.get('ordering', '-created_at')
        papers = papers.order_by(ordering).distinct()
        
        # Pagination
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 20))
        start = (page - 1) * page_size
        end = start + page_size
        
        total_count = papers.count()
        papers_page = papers[start:end]
        
        serializer = PaperListSerializer(papers_page, many=True, context={'request': request})
        
        return Response({
            'success': True,
            'data': serializer.data,
            'count': total_count,
            'page': page,
            'page_size': page_size,
            'total_pages': (total_count + page_size - 1) // page_size
        }, status=status.HTTP_200_OK)


class PaperDetailView(APIView):
    """
    GET: Retrieve paper details
    """
    permission_classes = [AllowAny]
    
    def get(self, request, paper_id):
        """Get paper by ID and increment view count"""
        try:
            paper = Paper.objects.select_related('category').prefetch_related('filters').get(
                id=paper_id,
                is_active=True
            )
        except Paper.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Paper not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Increment view count
        paper.views_count += 1
        paper.save(update_fields=['views_count'])
        
        serializer = PaperDetailSerializer(paper, context={'request': request})
        return Response({
            'success': True,
            'data': serializer.data
        }, status=status.HTTP_200_OK)


class PaperDownloadView(APIView):
    """
    POST: Increment download count for a paper
    """
    permission_classes = [AllowAny]
    
    def post(self, request, paper_id):
        """Increment download count"""
        try:
            paper = Paper.objects.get(id=paper_id, is_active=True)
        except Paper.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Paper not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Increment download count
        paper.downloads_count += 1
        paper.save(update_fields=['downloads_count'])
        
        # Return the PDF URL
        pdf_url = request.build_absolute_uri(paper.pdf_file.url) if paper.pdf_file else None
        
        return Response({
            'success': True,
            'message': 'Download recorded',
            'data': {
                'pdf_url': pdf_url,
                'downloads_count': paper.downloads_count
            }
        }, status=status.HTTP_200_OK)


class PaperSearchView(APIView):
    """
    GET: Search papers by title or description
    """
    permission_classes = [AllowAny]
    
    def get(self, request):
        """Search papers"""
        query = request.query_params.get('q', '')
        
        if not query or len(query) < 2:
            return Response({
                'success': False,
                'message': 'Search query must be at least 2 characters'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        papers = Paper.objects.filter(
            Q(title__icontains=query) | Q(description__icontains=query),
            is_active=True
        ).select_related('category').prefetch_related('filters')
        
        serializer = PaperListSerializer(papers, many=True, context={'request': request})
        
        return Response({
            'success': True,
            'data': serializer.data,
            'count': papers.count()
        }, status=status.HTTP_200_OK)


@method_decorator(xframe_options_exempt, name='dispatch')
class PaperFileView(APIView):
    """
    GET: Serve the PDF file for a paper. This view is exempt from X-Frame-Options so
    the PDF can be embedded in an <iframe> or <embed> on the frontend.
    """
    permission_classes = [AllowAny]

    def get(self, request, paper_id):
        try:
            paper = Paper.objects.get(id=paper_id, is_active=True)
        except Paper.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Paper not found'
            }, status=status.HTTP_404_NOT_FOUND)

        if not paper.pdf_file:
            return Response({
                'success': False,
                'message': 'No PDF file available for this paper'
            }, status=status.HTTP_404_NOT_FOUND)

        # Use FileResponse to efficiently stream large files
        try:
            file_path = paper.pdf_file.path
            response = FileResponse(open(file_path, 'rb'), content_type='application/pdf')
            # Let browser render inline in-frame
            filename = getattr(paper.pdf_file, 'name', 'paper.pdf').split('/')[-1]
            response['Content-Disposition'] = f'inline; filename="{filename}"'
            return response
        except Exception as exc:
            # Could not open file
            raise Http404('File not found')
