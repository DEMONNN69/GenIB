"""
Django admin configuration for Papers and Categories
"""

from django.contrib import admin
from .models import Category, Paper


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = [
        'name',
        'parent',
        'is_main',
        'display_order',
        'is_free',
        'paper_count',
        'is_active',
        'created_at'
    ]
    list_filter = ['is_main', 'is_free', 'is_active', 'is_downloadable', 'parent']
    search_fields = ['name', 'description', 'slug']
    ordering = ['display_order', 'name']
    list_editable = ['display_order', 'is_active']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'slug', 'description', 'icon')
        }),
        ('Hierarchy', {
            'fields': ('parent', 'is_main', 'display_order')
        }),
        ('Access & Pricing', {
            'fields': ('is_free', 'is_downloadable', 'is_online', 'is_printable')
        }),
        ('Status & Metadata', {
            'fields': ('is_active', 'paper_count', 'created_at', 'updated_at')
        }),
    )
    
    def get_readonly_fields(self, request, obj=None):
        """Make certain fields readonly"""
        readonly = ['created_at', 'updated_at', 'paper_count']
        if obj:  # Editing an existing object - make slug readonly to prevent URL changes
            readonly.append('slug')
        return readonly
    
    def get_prepopulated_fields(self, request, obj=None):
        """Only prepopulate slug when creating new category"""
        if obj is None:  # Creating new object
            return {'slug': ('name',)}
        return {}


@admin.register(Paper)
class PaperAdmin(admin.ModelAdmin):
    list_display = [
        'title',
        'category',
        'file_size_mb',
        'is_free',
        'is_featured',
        'is_active',
        'views_count',
        'downloads_count',
        'created_at'
    ]
    list_filter = [
        'category',
        'is_free',
        'is_premium',
        'is_featured',
        'is_active',
        'created_at'
    ]
    search_fields = ['title', 'description']
    list_editable = ['is_active', 'is_featured']
    filter_horizontal = ['filters']  # Nice UI for ManyToMany
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'category', 'description')
        }),
        ('Files', {
            'fields': ('pdf_file', 'thumbnail')
        }),
        ('Dynamic Filters', {
            'fields': ('filters',),
            'description': 'Select applicable filters (curriculum, subject, year, season, zone, etc.)'
        }),
        ('Metadata', {
            'fields': ('file_size', 'page_count'),
            'classes': ('collapse',)
        }),
        ('Access Control', {
            'fields': ('is_free', 'is_premium', 'is_active', 'is_featured')
        }),
        ('Statistics', {
            'fields': ('views_count', 'downloads_count'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['file_size', 'views_count', 'downloads_count']
    
    def file_size_mb(self, obj):
        return f"{obj.file_size_mb} MB" if obj.file_size else "—"
    file_size_mb.short_description = 'File Size'

