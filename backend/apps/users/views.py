"""
API Views for User operations
"""

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.shortcuts import get_object_or_404

from .models import User
from .serializers import (
    UserSerializer,
    UserProfileSerializer,
    UserUpdateSerializer,
    UserListSerializer
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
