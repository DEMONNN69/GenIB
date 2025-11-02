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
        # Will implement when Paper model is created
        return 0
    
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

