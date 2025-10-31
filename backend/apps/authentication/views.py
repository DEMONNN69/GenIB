"""
API Views for Authentication
"""

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken

from apps.users.serializers import UserSerializer
from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    ChangePasswordSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer
)
from .services import AuthService
from apps.users.services import UserService


class RegisterView(APIView):
    """
    POST: Register a new user
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        """Register new user"""
        serializer = RegisterSerializer(data=request.data)
        
        if serializer.is_valid():
            user = serializer.save()
            tokens = AuthService.get_tokens_for_user(user)
            user_data = UserSerializer(user).data
            
            return Response({
                'success': True,
                'message': 'User registered successfully',
                'data': {
                    'user': user_data,
                    'tokens': tokens
                }
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    """
    POST: Login user
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        """Login user"""
        serializer = LoginSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            user = serializer.validated_data['user']
            tokens = AuthService.get_tokens_for_user(user)
            user_data = UserSerializer(user).data
            
            return Response({
                'success': True,
                'message': 'Login successful',
                'data': {
                    'user': user_data,
                    'tokens': tokens
                }
            }, status=status.HTTP_200_OK)
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    """
    POST: Logout user (blacklist refresh token)
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Logout user"""
        try:
            refresh_token = request.data.get('refresh_token')
            
            if not refresh_token:
                return Response({
                    'success': False,
                    'message': 'Refresh token is required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            token = RefreshToken(refresh_token)
            token.blacklist()
            
            return Response({
                'success': True,
                'message': 'Logout successful'
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'success': False,
                'message': 'Invalid token'
            }, status=status.HTTP_400_BAD_REQUEST)


class RefreshTokenView(APIView):
    """
    POST: Refresh access token
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        """Refresh access token"""
        try:
            refresh_token = request.data.get('refresh')
            
            if not refresh_token:
                return Response({
                    'success': False,
                    'message': 'Refresh token is required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            token = RefreshToken(refresh_token)
            
            return Response({
                'success': True,
                'data': {
                    'access': str(token.access_token)
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'success': False,
                'message': 'Invalid or expired token'
            }, status=status.HTTP_400_BAD_REQUEST)


class ChangePasswordView(APIView):
    """
    POST: Change user password
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Change password"""
        serializer = ChangePasswordSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            try:
                AuthService.change_password(
                    request.user,
                    serializer.validated_data['old_password'],
                    serializer.validated_data['new_password']
                )
                
                return Response({
                    'success': True,
                    'message': 'Password changed successfully'
                }, status=status.HTTP_200_OK)
                
            except ValueError as e:
                return Response({
                    'success': False,
                    'message': str(e)
                }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class PasswordResetRequestView(APIView):
    """
    POST: Request password reset
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        """Request password reset"""
        serializer = PasswordResetRequestSerializer(data=request.data)
        
        if serializer.is_valid():
            email = serializer.validated_data['email']
            user = UserService.get_user_by_email(email)
            
            if user:
                token = AuthService.generate_password_reset_token(user)
                # TODO: Send email with reset token
                # In production, send this via email
                pass
            
            # Always return success to prevent email enumeration
            return Response({
                'success': True,
                'message': 'If the email exists, a password reset link has been sent'
            }, status=status.HTTP_200_OK)
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class PasswordResetConfirmView(APIView):
    """
    POST: Confirm password reset with token
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        """Confirm password reset"""
        serializer = PasswordResetConfirmSerializer(data=request.data)
        
        if serializer.is_valid():
            # TODO: Implement token validation and password reset
            # This is a placeholder implementation
            
            return Response({
                'success': True,
                'message': 'Password reset successful'
            }, status=status.HTTP_200_OK)
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class VerifyTokenView(APIView):
    """
    POST: Verify if token is valid
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        """Verify token"""
        token = request.data.get('token')
        
        if not token:
            return Response({
                'success': False,
                'message': 'Token is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        payload = AuthService.verify_token(token)
        
        if payload:
            return Response({
                'success': True,
                'message': 'Token is valid',
                'data': payload
            }, status=status.HTTP_200_OK)
        
        return Response({
            'success': False,
            'message': 'Invalid or expired token'
        }, status=status.HTTP_401_UNAUTHORIZED)
