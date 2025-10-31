"""
Business logic services for Authentication
"""

from django.contrib.auth import authenticate
from django.db import transaction
from django.utils import timezone
from rest_framework_simplejwt.tokens import RefreshToken
from apps.users.models import User


class AuthService:
    """
    Service class for authentication-related business logic
    """
    
    @staticmethod
    def register_user(validated_data):
        """
        Register a new user
        """
        with transaction.atomic():
            password = validated_data.pop('password')
            user = User.objects.create_user(
                password=password,
                **validated_data
            )
            return user
    
    @staticmethod
    def authenticate_user(email, password):
        """
        Authenticate user with email and password
        """
        user = authenticate(username=email, password=password)
        return user
    
    @staticmethod
    def get_tokens_for_user(user):
        """
        Generate JWT tokens for user
        """
        refresh = RefreshToken.for_user(user)
        
        # Update last login
        user.last_login = timezone.now()
        user.save(update_fields=['last_login'])
        
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }
    
    @staticmethod
    @transaction.atomic
    def change_password(user, old_password, new_password):
        """
        Change user password
        """
        if not user.check_password(old_password):
            raise ValueError("Old password is incorrect")
        
        user.set_password(new_password)
        user.save()
        return user
    
    @staticmethod
    def verify_token(token):
        """
        Verify JWT token
        """
        try:
            from rest_framework_simplejwt.tokens import AccessToken
            access_token = AccessToken(token)
            return access_token.payload
        except Exception:
            return None
    
    @staticmethod
    def blacklist_token(refresh_token):
        """
        Blacklist refresh token (logout)
        """
        try:
            from rest_framework_simplejwt.tokens import RefreshToken
            token = RefreshToken(refresh_token)
            token.blacklist()
            return True
        except Exception:
            return False
    
    @staticmethod
    def generate_password_reset_token(user):
        """
        Generate password reset token
        """
        # In production, use a more secure token generation
        # and store it in the database with expiration
        from django.contrib.auth.tokens import default_token_generator
        return default_token_generator.make_token(user)
    
    @staticmethod
    def validate_password_reset_token(user, token):
        """
        Validate password reset token
        """
        from django.contrib.auth.tokens import default_token_generator
        return default_token_generator.check_token(user, token)
    
    @staticmethod
    @transaction.atomic
    def reset_password(user, new_password):
        """
        Reset user password
        """
        user.set_password(new_password)
        user.save()
        return user
