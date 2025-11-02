"""
Custom User model for GenIB platform
"""

from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from .managers import UserManager


class User(AbstractBaseUser, PermissionsMixin):
    """
    Custom user model that uses email as the unique identifier
    instead of username.
    """
    
    # Basic Information
    email = models.EmailField(
        _('email address'),
        unique=True,
        error_messages={
            'unique': _("A user with that email already exists."),
        }
    )
    username = models.CharField(
        _('username'),
        max_length=150,
        unique=True,
        help_text=_('Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.'),
        error_messages={
            'unique': _("A user with that username already exists."),
        }
    )
    first_name = models.CharField(_('first name'), max_length=150, blank=True)
    last_name = models.CharField(_('last name'), max_length=150, blank=True)
    
    # Profile Information
    bio = models.TextField(_('bio'), max_length=500, blank=True)
    avatar = models.ImageField(_('avatar'), upload_to='avatars/', null=True, blank=True)
    phone_number = models.CharField(_('phone number'), max_length=20, blank=True)
    
    # Academic Information
    curriculum = models.CharField(
        _('curriculum'),
        max_length=50,
        blank=True,
        choices=[
            ('IB', 'IB Diploma'),
            ('CIE_IGCSE', 'CIE IGCSE'),
            ('CIE_ALEVEL', 'CIE A-Level'),
            ('EDEXCEL_IGCSE', 'Edexcel IGCSE'),
            ('EDEXCEL_ALEVEL', 'Edexcel A-Level'),
        ]
    )
    grade_level = models.CharField(_('grade level'), max_length=20, blank=True)
    school = models.CharField(_('school'), max_length=255, blank=True)
    subjects = models.JSONField(
        _('subjects'),
        default=list,
        blank=True,
        help_text=_('List of subjects the user is studying')
    )
    
    # Status Fields
    is_active = models.BooleanField(
        _('active'),
        default=True,
        help_text=_('Designates whether this user should be treated as active.'),
    )
    is_staff = models.BooleanField(
        _('staff status'),
        default=False,
        help_text=_('Designates whether the user can log into this admin site.'),
    )
    is_verified = models.BooleanField(
        _('email verified'),
        default=False,
        help_text=_('Designates whether the user has verified their email address.'),
    )
    
    # Timestamps
    date_joined = models.DateTimeField(_('date joined'), default=timezone.now)
    last_login = models.DateTimeField(_('last login'), null=True, blank=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    
    # Subscription
    is_premium = models.BooleanField(_('premium member'), default=False)
    premium_expires_at = models.DateTimeField(_('premium expires at'), null=True, blank=True)
    
    objects = UserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    class Meta:
        verbose_name = _('user')
        verbose_name_plural = _('users')
        ordering = ['-date_joined']
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['username']),
            models.Index(fields=['-date_joined']),
        ]
    
    def __str__(self):
        return self.email
    
    def get_full_name(self):
        """Return the first_name plus the last_name, with a space in between."""
        full_name = f'{self.first_name} {self.last_name}'
        return full_name.strip() or self.username
    
    def get_short_name(self):
        """Return the short name for the user."""
        return self.first_name or self.username
    
    @property
    def is_premium_active(self):
        """Check if premium subscription is active"""
        if not self.is_premium:
            return False
        if self.premium_expires_at and self.premium_expires_at < timezone.now():
            return False
        return True


class Favorite(models.Model):
    """
    Model to track user's favorite papers
    """
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='favorites'
    )
    paper = models.ForeignKey(
        'papers.Paper',
        on_delete=models.CASCADE,
        related_name='favorited_by'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['user', 'paper']
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['paper']),
        ]
    
    def __str__(self):
        return f"{self.user.email} - {self.paper.title}"
