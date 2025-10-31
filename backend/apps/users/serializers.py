"""
Serializers for User model
"""

from rest_framework import serializers
from .models import User


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for User model - Full details
    """
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    is_premium_active = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'username',
            'first_name',
            'last_name',
            'full_name',
            'bio',
            'avatar',
            'phone_number',
            'curriculum',
            'grade_level',
            'school',
            'is_verified',
            'is_premium',
            'is_premium_active',
            'premium_expires_at',
            'date_joined',
            'last_login',
        ]
        read_only_fields = [
            'id',
            'is_verified',
            'is_premium',
            'premium_expires_at',
            'date_joined',
            'last_login',
        ]


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for User profile - Limited fields
    """
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'first_name',
            'last_name',
            'full_name',
            'avatar',
            'bio',
            'curriculum',
            'grade_level',
        ]
        read_only_fields = ['id', 'username']


class UserUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating user profile
    """
    
    class Meta:
        model = User
        fields = [
            'first_name',
            'last_name',
            'bio',
            'avatar',
            'phone_number',
            'curriculum',
            'grade_level',
            'school',
        ]
    
    def validate_avatar(self, value):
        """Validate avatar file size"""
        if value and value.size > 5 * 1024 * 1024:  # 5MB
            raise serializers.ValidationError("Avatar file size cannot exceed 5MB")
        return value


class UserListSerializer(serializers.ModelSerializer):
    """
    Serializer for listing users - Minimal fields
    """
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'full_name',
            'avatar',
            'is_premium',
            'date_joined',
        ]
        read_only_fields = fields
