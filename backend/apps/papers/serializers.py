"""
Serializers for Papers and Categories
"""

from rest_framework import serializers
from .models import Category, Paper, Bundle
from apps.filters.models import FilterOption


class CategorySerializer(serializers.ModelSerializer):
    """
    Full serializer for Category with all details
    """
    paper_count = serializers.IntegerField(read_only=True)
    full_path = serializers.CharField(read_only=True)
    is_subcategory = serializers.BooleanField(read_only=True)
    subcategories_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = [
            'id',
            'name',
            'slug',
            'description',
            'icon',
            'parent',
            'is_free',
            'is_downloadable',
            'is_online',
            'is_printable',
            'is_main',
            'display_order',
            'is_active',
            'paper_count',
            'full_path',
            'is_subcategory',
            'subcategories_count',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']
    
    def get_subcategories_count(self, obj):
        """Get count of direct subcategories"""
        return obj.subcategories.filter(is_active=True).count()


class CategoryListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for listing categories
    """
    paper_count = serializers.IntegerField(read_only=True)
    subcategories_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = [
            'id',
            'name',
            'slug',
            'description',
            'icon',
            'is_free',
            'is_downloadable',
            'is_online',
            'is_printable',
            'is_main',
            'display_order',
            'paper_count',
            'subcategories_count',
        ]
    
    def get_subcategories_count(self, obj):
        """Get count of direct subcategories"""
        return obj.subcategories.filter(is_active=True).count()


class CategoryTreeSerializer(serializers.ModelSerializer):
    """
    Nested serializer for category tree structure
    """
    subcategories = serializers.SerializerMethodField()
    paper_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Category
        fields = [
            'id',
            'name',
            'slug',
            'description',
            'icon',
            'is_free',
            'is_downloadable',
            'is_online',
            'is_printable',
            'is_main',
            'display_order',
            'paper_count',
            'subcategories',
        ]
    
    def get_subcategories(self, obj):
        """Recursively serialize subcategories"""
        subcats = obj.subcategories.filter(is_active=True)
        return CategoryTreeSerializer(subcats, many=True).data


class CategoryCreateUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating/updating categories
    """
    
    class Meta:
        model = Category
        fields = [
            'name',
            'description',
            'icon',
            'parent',
            'is_free',
            'is_downloadable',
            'is_online',
            'is_printable',
            'is_main',
            'display_order',
            'is_active',
        ]
    
    def validate_parent(self, value):
        """Ensure parent is not self and prevent circular references"""
        if self.instance and value:
            if value == self.instance:
                raise serializers.ValidationError("Category cannot be its own parent")
            
            # Check for circular reference
            current = value
            while current.parent:
                if current.parent == self.instance:
                    raise serializers.ValidationError("Circular parent reference detected")
                current = current.parent
        
        return value


class FilterOptionSerializer(serializers.ModelSerializer):
    """Serializer for filter options"""
    filter_type_name = serializers.CharField(source='filter_type.name', read_only=True)
    filter_type_slug = serializers.CharField(source='filter_type.slug', read_only=True)
    
    class Meta:
        model = FilterOption
        fields = ['id', 'name', 'code', 'slug', 'filter_type_name', 'filter_type_slug']


class PaperListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing papers"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_slug = serializers.CharField(source='category.slug', read_only=True)
    filters = FilterOptionSerializer(many=True, read_only=True)
    pdf_url = serializers.SerializerMethodField()
    thumbnail_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Paper
        fields = [
            'id',
            'title',
            'category_name',
            'category_slug',
            'pdf_url',
            'thumbnail_url',
            'file_size_mb',
            'page_count',
            'is_free',
            'is_premium',
            'is_featured',
            'views_count',
            'downloads_count',
            'filters',
            'created_at',
        ]
    
    def get_pdf_url(self, obj):
        """Get full URL for PDF file via file endpoint (X-Frame-Options exempt)"""
        request = self.context.get('request')
        if obj.pdf_file and request:
            # Return the file endpoint URL instead of direct media URL
            # This endpoint has xframe_options_exempt so it can be embedded in iframes
            from django.urls import reverse
            file_path = reverse('papers:paper-file', kwargs={'paper_id': obj.id})
            return request.build_absolute_uri(file_path)
        return None
    
    def get_thumbnail_url(self, obj):
        """Get full URL for thumbnail"""
        request = self.context.get('request')
        if obj.thumbnail and request:
            return request.build_absolute_uri(obj.thumbnail.url)
        return None


class PaperDetailSerializer(serializers.ModelSerializer):
    """Full serializer for paper details"""
    category = CategoryListSerializer(read_only=True)
    filters = FilterOptionSerializer(many=True, read_only=True)
    pdf_url = serializers.SerializerMethodField()
    thumbnail_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Paper
        fields = [
            'id',
            'title',
            'description',
            'category',
            'pdf_url',
            'thumbnail_url',
            'file_size',
            'file_size_mb',
            'page_count',
            'is_free',
            'is_premium',
            'is_active',
            'is_featured',
            'views_count',
            'downloads_count',
            'filters',
            'created_at',
            'updated_at',
        ]
    
    def get_pdf_url(self, obj):
        """Get full URL for PDF file via file endpoint (X-Frame-Options exempt)"""
        request = self.context.get('request')
        if obj.pdf_file and request:
            # Return the file endpoint URL instead of direct media URL
            # This endpoint has xframe_options_exempt so it can be embedded in iframes
            from django.urls import reverse
            file_path = reverse('papers:paper-file', kwargs={'paper_id': obj.id})
            return request.build_absolute_uri(file_path)
        return None
    
    def get_thumbnail_url(self, obj):
        """Get full URL for thumbnail"""
        request = self.context.get('request')
        if obj.thumbnail and request:
            return request.build_absolute_uri(obj.thumbnail.url)
        return None


class PaperCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating papers"""
    
    class Meta:
        model = Paper
        fields = [
            'title',
            'description',
            'category',
            'pdf_file',
            'thumbnail',
            'page_count',
            'is_free',
            'is_premium',
            'is_active',
            'is_featured',
            'filters',
        ]


class BundleListSerializer(serializers.ModelSerializer):
    """
    Serializer for listing bundles (minimal fields)
    """
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_slug = serializers.CharField(source='category.slug', read_only=True)
    paper_count = serializers.IntegerField(read_only=True)
    filters = FilterOptionSerializer(many=True, read_only=True)
    
    class Meta:
        model = Bundle
        fields = [
            'id',
            'name',
            'slug',
            'description',
            'category',
            'category_name',
            'category_slug',
            'cover_image',
            'is_paid',
            'price',
            'paper_count',
            'file_size',
            'is_active',
            'is_featured',
            'display_order',
            'views_count',
            'downloads_count',
            'purchase_count',
            'filters',
            'created_at',
        ]
        read_only_fields = ['id', 'slug', 'views_count', 'downloads_count', 'purchase_count', 'created_at']


class BundleDetailSerializer(serializers.ModelSerializer):
    """
    Detailed serializer for Bundle with all information
    """
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_slug = serializers.CharField(source='category.slug', read_only=True)
    paper_count = serializers.IntegerField(read_only=True)
    papers = PaperListSerializer(many=True, read_only=True)
    filters = FilterOptionSerializer(many=True, read_only=True)
    bundle_pdf_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Bundle
        fields = [
            'id',
            'name',
            'slug',
            'description',
            'category',
            'category_name',
            'category_slug',
            'papers',
            'paper_count',
            'bundle_pdf',
            'bundle_pdf_url',
            'cover_image',
            'is_paid',
            'price',
            'file_size',
            'is_active',
            'is_featured',
            'display_order',
            'views_count',
            'downloads_count',
            'purchase_count',
            'filters',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'slug',
            'views_count',
            'downloads_count',
            'purchase_count',
            'created_at',
            'updated_at'
        ]
    
    def get_bundle_pdf_url(self, obj):
        """Get the URL for the bundle PDF file endpoint"""
        if obj.bundle_pdf:
            from django.urls import reverse
            return reverse('papers:bundle-file', kwargs={'bundle_id': obj.id})
        return None

