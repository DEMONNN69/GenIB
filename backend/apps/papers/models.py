"""
Models for Papers and Categories
"""

from django.db import models
from django.utils.text import slugify
from django.core.validators import MinValueValidator


class Category(models.Model):
    """
    Category model for organizing papers
    Supports parent-child relationships for subcategories
    """
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    description = models.TextField(blank=True)
    icon = models.CharField(
        max_length=50,
        blank=True,
        help_text="Icon name from iconsax-react library"
    )
    
    # Parent-child relationship for subcategories
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='subcategories'
    )
    
    # Pricing and access flags
    is_free = models.BooleanField(default=True)
    is_downloadable = models.BooleanField(default=True)
    is_online = models.BooleanField(default=False)
    is_printable = models.BooleanField(default=False)
    
    # UI display
    is_main = models.BooleanField(
        default=False,
        help_text="Mark as main/featured category"
    )
    display_order = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)],
        help_text="Order in which categories are displayed"
    )
    
    # Metadata
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Category'
        verbose_name_plural = 'Categories'
        ordering = ['display_order', 'name']
        indexes = [
            models.Index(fields=['slug']),
            models.Index(fields=['parent']),
            models.Index(fields=['is_active', 'display_order']),
        ]
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        """Auto-generate slug from name if not provided"""
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)
    
    @property
    def paper_count(self):
        """Return count of papers in this category (including subcategories)"""
        return self.papers.filter(is_active=True).count()
    
    @property
    def full_path(self):
        """Return full category path (e.g., 'Parent > Child')"""
        if self.parent:
            return f"{self.parent.full_path} > {self.name}"
        return self.name
    
    @property
    def is_subcategory(self):
        """Check if this is a subcategory"""
        return self.parent is not None
    
    def get_all_subcategories(self):
        """Recursively get all subcategories"""
        subcats = list(self.subcategories.all())
        for subcat in list(subcats):
            subcats.extend(subcat.get_all_subcategories())
        return subcats


class Paper(models.Model):
    """
    Paper model for storing past papers, worksheets, etc.
    Uses dynamic filters from the filters app
    """
    
    # Basic Information
    title = models.CharField(max_length=255, help_text="e.g., Mathematics Paper 1")
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name='papers',
        help_text="Category this paper belongs to"
    )
    description = models.TextField(blank=True)
    
    # File Upload
    pdf_file = models.FileField(
        upload_to='papers/%Y/%m/',
        help_text="Upload PDF file"
    )
    thumbnail = models.ImageField(
        upload_to='thumbnails/%Y/%m/',
        blank=True,
        null=True,
        help_text="Thumbnail image for the paper"
    )
    
    # Dynamic Filters (ManyToMany to FilterOption)
    filters = models.ManyToManyField(
        'filters.FilterOption',
        related_name='papers',
        blank=True,
        help_text="Select applicable filters (curriculum, subject, year, etc.)"
    )
    
    # Metadata
    file_size = models.IntegerField(
        blank=True,
        null=True,
        help_text="File size in bytes (auto-calculated)"
    )
    page_count = models.IntegerField(
        blank=True,
        null=True,
        help_text="Number of pages in PDF"
    )
    
    # Access Control
    is_free = models.BooleanField(
        default=True,
        help_text="Is this paper free to access?"
    )
    is_premium = models.BooleanField(
        default=False,
        help_text="Requires premium subscription?"
    )
    
    # Status
    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(
        default=False,
        help_text="Show in featured section?"
    )
    
    # Statistics
    views_count = models.IntegerField(default=0)
    downloads_count = models.IntegerField(default=0)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Paper'
        verbose_name_plural = 'Papers'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['category', 'is_active']),
            models.Index(fields=['is_featured', 'is_active']),
            models.Index(fields=['-created_at']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.category.name}"
    
    def save(self, *args, **kwargs):
        """Auto-calculate file size if not provided"""
        if self.pdf_file and not self.file_size:
            self.file_size = self.pdf_file.size
        super().save(*args, **kwargs)
    
    @property
    def file_size_mb(self):
        """Return file size in MB"""
        if self.file_size:
            return round(self.file_size / (1024 * 1024), 2)
        return 0
    
    def get_filter_values(self, filter_type_slug):
        """Get filter options for a specific filter type"""
        return self.filters.filter(
            filter_type__slug=filter_type_slug,
            filter_type__is_active=True,
            is_active=True
        )


class Bundle(models.Model):
    """
    Bundle model for grouping multiple papers together
    Can be free or paid
    """
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=280, unique=True, blank=True)
    description = models.TextField(blank=True)
    
    # Category relationship
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name='bundles',
        help_text="Category this bundle belongs to"
    )
    
    # Papers included in this bundle
    papers = models.ManyToManyField(
        Paper,
        related_name='bundles',
        blank=True,
        help_text="Papers included in this bundle"
    )
    
    # Optional combined PDF file
    bundle_pdf = models.FileField(
        upload_to='bundles/%Y/%m/',
        null=True,
        blank=True,
        help_text="Optional combined PDF file for the entire bundle"
    )
    
    # Cover/Thumbnail
    cover_image = models.ImageField(
        upload_to='bundle_covers/',
        null=True,
        blank=True,
        help_text="Cover image for the bundle"
    )
    
    # Pricing
    is_paid = models.BooleanField(
        default=False,
        help_text="Is this a paid bundle?"
    )
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0)],
        help_text="Price in USD (required if is_paid is True)"
    )
    
    # Filters (same as Paper for consistency)
    filters = models.ManyToManyField(
        'filters.FilterOption',
        related_name='bundles',
        blank=True,
        help_text="Dynamic filters applied to this bundle"
    )
    
    # File metadata
    file_size = models.BigIntegerField(
        null=True,
        blank=True,
        help_text="Bundle PDF file size in bytes"
    )
    
    # Status
    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(
        default=False,
        help_text="Show in featured section?"
    )
    
    # Display
    display_order = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)],
        help_text="Order in which bundles are displayed"
    )
    
    # Statistics
    views_count = models.IntegerField(default=0)
    downloads_count = models.IntegerField(default=0)
    purchase_count = models.IntegerField(
        default=0,
        help_text="Number of purchases (for paid bundles)"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Bundle'
        verbose_name_plural = 'Bundles'
        ordering = ['display_order', '-created_at']
        indexes = [
            models.Index(fields=['category', 'is_active']),
            models.Index(fields=['is_paid', 'is_active']),
            models.Index(fields=['is_featured', 'is_active']),
            models.Index(fields=['display_order', '-created_at']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.category.name})"
    
    def save(self, *args, **kwargs):
        """Auto-generate slug and calculate file size"""
        if not self.slug:
            self.slug = slugify(self.name)
        
        if self.bundle_pdf and not self.file_size:
            self.file_size = self.bundle_pdf.size
        
        # Ensure price is set if is_paid is True
        if self.is_paid and self.price is None:
            raise ValueError("Price must be set for paid bundles")
        
        # Clear price if not paid
        if not self.is_paid:
            self.price = None
        
        super().save(*args, **kwargs)
    
    @property
    def file_size_mb(self):
        """Return file size in MB"""
        if self.file_size:
            return round(self.file_size / (1024 * 1024), 2)
        return 0
    
    @property
    def paper_count(self):
        """Return number of papers in bundle"""
        return self.papers.count()
    
    @property
    def is_free(self):
        """Return True if bundle is free"""
        return not self.is_paid


