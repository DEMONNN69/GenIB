"""
Django admin configuration for Papers and Categories
"""

from django.contrib import admin
from django.utils.html import format_html
from .models import Category, Paper, Bundle


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


@admin.register(Bundle)
class BundleAdmin(admin.ModelAdmin):
    list_display = [
        'name',
        'category',
        'paper_count_display',
        'pricing_display',
        'file_size_mb',
        'is_featured',
        'is_active',
        'purchase_count',
        'created_at'
    ]
    list_filter = [
        'category',
        'is_paid',
        'is_featured',
        'is_active',
        'created_at'
    ]
    search_fields = ['name', 'description', 'slug']
    list_editable = ['is_active', 'is_featured']
    filter_horizontal = ['papers', 'filters']  # Nice UI for ManyToMany
    date_hierarchy = 'created_at'
    ordering = ['display_order', '-created_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'slug', 'category', 'description')
        }),
        ('Papers in Bundle', {
            'fields': ('papers',),
            'description': 'Select papers to include in this bundle'
        }),
        ('Bundle File', {
            'fields': ('bundle_pdf', 'cover_image'),
            'description': 'Optional: Upload a combined PDF file for the entire bundle'
        }),
        ('Dynamic Filters', {
            'fields': ('filters',),
            'description': 'Select applicable filters (curriculum, subject, etc.)',
            'classes': ('collapse',)
        }),
        ('Pricing', {
            'fields': ('is_paid', 'price'),
            'description': 'Set pricing for this bundle. Price is required if "Is paid" is checked.'
        }),
        ('Display & Status', {
            'fields': ('is_active', 'is_featured', 'display_order')
        }),
        ('Statistics', {
            'fields': ('views_count', 'downloads_count', 'purchase_count', 'file_size'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['file_size', 'views_count', 'downloads_count', 'purchase_count', 'created_at', 'updated_at']
    
    def get_prepopulated_fields(self, request, obj=None):
        """Only prepopulate slug when creating new bundle"""
        if obj is None:
            return {'slug': ('name',)}
        return {}
    
    def paper_count_display(self, obj):
        """Display number of papers in bundle"""
        count = obj.paper_count
        if count == 0:
            return format_html('<span style="color: red;">0 papers</span>')
        return format_html('<span style="color: green;">{} paper{}</span>', count, 's' if count > 1 else '')
    paper_count_display.short_description = 'Papers'
    
    def pricing_display(self, obj):
        """Display pricing information"""
        if obj.is_paid:
            if obj.price:
                return format_html('<span style="color: #0066cc; font-weight: bold;">${}</span>', obj.price)
            return format_html('<span style="color: red;">PAID - No Price Set!</span>')
        return format_html('<span style="color: green;">FREE</span>')
    pricing_display.short_description = 'Pricing'
    
    def file_size_mb(self, obj):
        """Display file size"""
        return f"{obj.file_size_mb} MB" if obj.file_size else "—"
    file_size_mb.short_description = 'File Size'
    
    def save_model(self, request, obj, form, change):
        """Custom save with validation"""
        try:
            super().save_model(request, obj, form, change)
        except ValueError as e:
            from django.contrib import messages
            messages.error(request, str(e))


