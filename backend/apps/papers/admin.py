"""
Django admin configuration for Papers and Categories
"""

from django.contrib import admin
from .models import Category


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

