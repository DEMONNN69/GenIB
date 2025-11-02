"""
Django admin for dynamic filter system
"""

from django.contrib import admin
from .models import FilterType, FilterOption


@admin.register(FilterType)
class FilterTypeAdmin(admin.ModelAdmin):
    list_display = [
        'name',
        'slug',
        'is_required',
        'is_hierarchical',
        'allow_multiple',
        'option_count',
        'display_order',
        'is_active',
        'show_in_frontend'
    ]
    list_filter = ['is_required', 'is_hierarchical', 'allow_multiple', 'is_active', 'show_in_frontend']
    search_fields = ['name', 'description']
    list_editable = ['display_order', 'is_active']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'slug', 'description')
        }),
        ('Behavior', {
            'fields': ('is_required', 'is_hierarchical', 'allow_multiple')
        }),
        ('Display Settings', {
            'fields': ('display_order', 'is_active', 'show_in_frontend')
        }),
    )
    
    def get_prepopulated_fields(self, request, obj=None):
        if obj is None:
            return {'slug': ('name',)}
        return {}
    
    def get_readonly_fields(self, request, obj=None):
        if obj:
            return ['slug']
        return []


@admin.register(FilterOption)
class FilterOptionAdmin(admin.ModelAdmin):
    list_display = [
        'name',
        'filter_type',
        'code',
        'parent',
        'display_order',
        'is_active',
        'is_featured',
        'created_at'
    ]
    list_filter = ['filter_type', 'is_active', 'is_featured', 'parent']
    search_fields = ['name', 'code', 'description']
    list_editable = ['display_order', 'is_active']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('filter_type', 'name', 'code', 'slug', 'description')
        }),
        ('Hierarchy', {
            'fields': ('parent',),
            'description': 'Only applicable if filter type is hierarchical'
        }),
        ('Display Settings', {
            'fields': ('display_order', 'icon', 'color')
        }),
        ('Status', {
            'fields': ('is_active', 'is_featured')
        }),
    )
    
    def get_prepopulated_fields(self, request, obj=None):
        if obj is None:
            return {'slug': ('name',), 'code': ('name',)}
        return {}
    
    def get_readonly_fields(self, request, obj=None):
        if obj:
            return ['slug', 'code']
        return []
