"""
Dynamic filter system models
Allows creating new filter types and options dynamically
"""

from django.db import models
from django.utils.text import slugify
from django.core.validators import MinValueValidator


class FilterType(models.Model):
    """
    Defines a type of filter (e.g., Curriculum, Subject, Season)
    Admins can create new filter types dynamically
    """
    name = models.CharField(
        max_length=100,
        unique=True,
        help_text="Name of the filter type (e.g., Curriculum, Subject, Season)"
    )
    slug = models.SlugField(
        max_length=120,
        unique=True,
        blank=True,
        help_text="URL-friendly version of the name"
    )
    description = models.TextField(
        blank=True,
        help_text="Description of what this filter represents"
    )
    
    # Behavior flags
    is_required = models.BooleanField(
        default=False,
        help_text="Is this filter required when creating papers?"
    )
    is_hierarchical = models.BooleanField(
        default=False,
        help_text="Can options have parent-child relationships?"
    )
    allow_multiple = models.BooleanField(
        default=False,
        help_text="Can papers have multiple values for this filter?"
    )
    
    # Display settings
    display_order = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)],
        help_text="Order in which filters appear in forms and frontend"
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Show this filter in admin and frontend?"
    )
    show_in_frontend = models.BooleanField(
        default=True,
        help_text="Show this filter in frontend search/filter UI?"
    )
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Filter Type'
        verbose_name_plural = 'Filter Types'
        ordering = ['display_order', 'name']
        indexes = [
            models.Index(fields=['slug']),
            models.Index(fields=['is_active', 'display_order']),
        ]
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)
    
    @property
    def option_count(self):
        """Return count of active options for this filter"""
        return self.options.filter(is_active=True).count()


class FilterOption(models.Model):
    """
    Individual options for a filter type (e.g., "IB Diploma", "Cambridge IGCSE")
    """
    filter_type = models.ForeignKey(
        FilterType,
        on_delete=models.CASCADE,
        related_name='options',
        help_text="Which filter type this option belongs to"
    )
    
    name = models.CharField(
        max_length=200,
        help_text="Display name (e.g., 'IB Diploma', 'Mathematics')"
    )
    code = models.CharField(
        max_length=50,
        blank=True,
        help_text="Short code for this option (e.g., 'IB', 'MATH')"
    )
    slug = models.SlugField(
        max_length=220,
        blank=True,
        help_text="URL-friendly version"
    )
    description = models.TextField(
        blank=True,
        help_text="Additional information about this option"
    )
    
    # Hierarchical support
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='children',
        help_text="Parent option (for hierarchical filters)"
    )
    
    # Display settings
    display_order = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)],
        help_text="Order in which this option appears in dropdowns"
    )
    icon = models.CharField(
        max_length=50,
        blank=True,
        help_text="Optional icon name"
    )
    color = models.CharField(
        max_length=7,
        blank=True,
        help_text="Optional hex color (e.g., #FF5733)"
    )
    
    # Status
    is_active = models.BooleanField(
        default=True,
        help_text="Show this option in dropdowns?"
    )
    is_featured = models.BooleanField(
        default=False,
        help_text="Highlight this option?"
    )
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Filter Option'
        verbose_name_plural = 'Filter Options'
        ordering = ['filter_type', 'display_order', 'name']
        unique_together = [['filter_type', 'code']]
        indexes = [
            models.Index(fields=['filter_type', 'is_active']),
            models.Index(fields=['slug']),
            models.Index(fields=['parent']),
        ]
    
    def __str__(self):
        if self.parent:
            return f"{self.filter_type.name}: {self.parent.name} > {self.name}"
        return f"{self.filter_type.name}: {self.name}"
    
    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name)
            self.slug = base_slug
            
        if not self.code:
            self.code = self.name.upper().replace(' ', '_')[:50]
            
        super().save(*args, **kwargs)
    
    @property
    def full_path(self):
        """Return full hierarchical path"""
        if self.parent:
            return f"{self.parent.full_path} > {self.name}"
        return self.name
    
    @property
    def has_children(self):
        """Check if this option has child options"""
        return self.children.exists()
