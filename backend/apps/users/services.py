"""
Business logic services for User operations
"""

from django.db import transaction
from django.db.models import Q
from django.core.exceptions import ValidationError
from .models import User


class UserService:
    """
    Service class for user-related business logic
    """
    
    @staticmethod
    def get_user_by_id(user_id):
        """Get user by ID"""
        try:
            return User.objects.get(id=user_id, is_active=True)
        except User.DoesNotExist:
            return None
    
    @staticmethod
    def get_user_by_email(email):
        """Get user by email"""
        try:
            return User.objects.get(email=email, is_active=True)
        except User.DoesNotExist:
            return None
    
    @staticmethod
    def get_user_by_username(username):
        """Get user by username"""
        try:
            return User.objects.get(username=username, is_active=True)
        except User.DoesNotExist:
            return None
    
    @staticmethod
    @transaction.atomic
    def update_user_profile(user, validated_data):
        """
        Update user profile with validated data
        """
        for field, value in validated_data.items():
            setattr(user, field, value)
        user.save()
        return user
    
    @staticmethod
    def check_email_exists(email):
        """Check if email already exists"""
        return User.objects.filter(email=email).exists()
    
    @staticmethod
    def check_username_exists(username):
        """Check if username already exists"""
        return User.objects.filter(username=username).exists()
    
    @staticmethod
    @transaction.atomic
    def deactivate_user(user):
        """Deactivate user account"""
        user.is_active = False
        user.save()
        return user
    
    @staticmethod
    @transaction.atomic
    def verify_user_email(user):
        """Mark user email as verified"""
        user.is_verified = True
        user.save()
        return user
    
    @staticmethod
    def get_premium_users():
        """Get all active premium users"""
        return User.objects.filter(is_premium=True, is_active=True)
    
    @staticmethod
    def search_users(query):
        """Search users by username or email"""
        return User.objects.filter(
            Q(username__icontains=query) | Q(email__icontains=query),
            is_active=True
        )
