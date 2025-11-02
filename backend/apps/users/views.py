"""
API Views for User operations
"""

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.shortcuts import get_object_or_404

from .models import User, Favorite
from .serializers import (
    UserSerializer,
    UserProfileSerializer,
    UserUpdateSerializer,
    UserListSerializer,
    FavoriteWithPaperSerializer
)
from .services import UserService


class UserProfileView(APIView):
    """
    GET: Retrieve current user profile
    PUT: Update current user profile
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [JSONParser, MultiPartParser, FormParser]
    
    def get(self, request):
        """Get current user profile"""
        serializer = UserSerializer(request.user)
        return Response({
            'success': True,
            'data': serializer.data
        }, status=status.HTTP_200_OK)
    
    def put(self, request):
        """Update current user profile"""
        serializer = UserUpdateSerializer(
            request.user,
            data=request.data,
            partial=True
        )
        
        if serializer.is_valid():
            user = UserService.update_user_profile(
                request.user,
                serializer.validated_data
            )
            response_serializer = UserSerializer(user)
            return Response({
                'success': True,
                'message': 'Profile updated successfully',
                'data': response_serializer.data
            }, status=status.HTTP_200_OK)
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class UserDetailView(APIView):
    """
    GET: Retrieve user profile by ID
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, user_id):
        """Get user profile by ID"""
        user = UserService.get_user_by_id(user_id)
        
        if not user:
            return Response({
                'success': False,
                'message': 'User not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        serializer = UserProfileSerializer(user)
        return Response({
            'success': True,
            'data': serializer.data
        }, status=status.HTTP_200_OK)


class UserDeactivateView(APIView):
    """
    POST: Deactivate current user account
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Deactivate user account"""
        UserService.deactivate_user(request.user)
        return Response({
            'success': True,
            'message': 'Account deactivated successfully'
        }, status=status.HTTP_200_OK)


class UserSearchView(APIView):
    """
    GET: Search users by username or email
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Search users"""
        query = request.query_params.get('q', '')
        
        if not query or len(query) < 3:
            return Response({
                'success': False,
                'message': 'Search query must be at least 3 characters'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        users = UserService.search_users(query)
        serializer = UserListSerializer(users, many=True)
        
        return Response({
            'success': True,
            'data': serializer.data,
            'count': users.count()
        }, status=status.HTTP_200_OK)


class UserFavoritesListView(APIView):
    """
    GET: List all favorite papers for the authenticated user
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get user's favorite papers"""
        favorites = Favorite.objects.filter(
            user=request.user
        ).select_related('paper__category').prefetch_related('paper__filters')
        
        serializer = FavoriteWithPaperSerializer(
            favorites, 
            many=True, 
            context={'request': request}
        )
        
        return Response({
            'success': True,
            'data': serializer.data,
            'count': favorites.count()
        }, status=status.HTTP_200_OK)


class ToggleFavoriteView(APIView):
    """
    POST: Toggle favorite status for a paper (add if not exists, remove if exists)
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Toggle favorite for a paper"""
        paper_id = request.data.get('paper_id')
        
        if not paper_id:
            return Response({
                'success': False,
                'message': 'paper_id is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        from apps.papers.models import Paper
        
        try:
            paper = Paper.objects.get(id=paper_id, is_active=True)
        except Paper.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Paper not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Check if favorite exists
        favorite = Favorite.objects.filter(user=request.user, paper=paper).first()
        
        if favorite:
            # Remove favorite
            favorite.delete()
            return Response({
                'success': True,
                'message': 'Paper removed from favorites',
                'is_favorited': False
            }, status=status.HTTP_200_OK)
        else:
            # Add favorite
            Favorite.objects.create(user=request.user, paper=paper)
            return Response({
                'success': True,
                'message': 'Paper added to favorites',
                'is_favorited': True
            }, status=status.HTTP_201_CREATED)


class CheckFavoriteView(APIView):
    """
    GET: Check if a paper is favorited by the authenticated user
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, paper_id):
        """Check if paper is favorited"""
        is_favorited = Favorite.objects.filter(
            user=request.user,
            paper_id=paper_id
        ).exists()
        
        return Response({
            'success': True,
            'is_favorited': is_favorited
        }, status=status.HTTP_200_OK)
