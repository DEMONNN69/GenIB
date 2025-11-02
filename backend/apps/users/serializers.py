"""
Serializers for User model
"""

from rest_framework import serializers
from .models import User, Favorite


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for User model - Full details
    """
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    is_premium_active = serializers.BooleanField(read_only=True)
    favorite_count = serializers.SerializerMethodField()
    
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
            'subjects',
            'is_verified',
            'is_premium',
            'is_premium_active',
            'premium_expires_at',
            'date_joined',
            'last_login',
            'favorite_count',
        ]
        read_only_fields = [
            'id',
            'is_verified',
            'is_premium',
            'premium_expires_at',
            'date_joined',
            'last_login',
        ]
    
    def get_favorite_count(self, obj):
        """Get count of user's favorites"""
        return obj.favorites.count()


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
            'subjects',
        ]
    
    def validate_avatar(self, value):
        """Validate avatar file size"""
        if value and value.size > 5 * 1024 * 1024:  # 5MB
            raise serializers.ValidationError("Avatar file size cannot exceed 5MB")
        return value
    
    def validate_subjects(self, value):
        """Validate subjects is a list"""
        if not isinstance(value, list):
            raise serializers.ValidationError("Subjects must be a list")
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


class FavoriteSerializer(serializers.ModelSerializer):
    """
    Basic serializer for Favorite
    """
    paper_id = serializers.IntegerField(source='paper.id', read_only=True)
    paper_title = serializers.CharField(source='paper.title', read_only=True)
    
    class Meta:
        model = Favorite
        fields = ['id', 'paper_id', 'paper_title', 'created_at']
        read_only_fields = fields


class FavoriteWithPaperSerializer(serializers.ModelSerializer):
    """
    Favorite serializer with full paper details
    """
    paper = serializers.SerializerMethodField()
    
    class Meta:
        model = Favorite
        fields = ['id', 'paper', 'created_at']
        read_only_fields = fields
    
    def get_paper(self, obj):
        """Get full paper details"""
        from apps.papers.serializers import PaperListSerializer
        return PaperListSerializer(obj.paper, context=self.context).data
