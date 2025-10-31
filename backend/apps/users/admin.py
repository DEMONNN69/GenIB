"""
Admin configuration for Users app
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Custom admin for User model"""
    
    list_display = [
        'email',
        'username',
        'first_name',
        'last_name',
        'is_verified',
        'is_premium',
        'is_staff',
        'date_joined'
    ]
    list_filter = [
        'is_staff',
        'is_superuser',
        'is_active',
        'is_verified',
        'is_premium',
        'curriculum',
        'date_joined'
    ]
    search_fields = ['email', 'username', 'first_name', 'last_name']
    ordering = ['-date_joined']
    
    fieldsets = (
        (None, {'fields': ('email', 'username', 'password')}),
        (_('Personal info'), {'fields': ('first_name', 'last_name', 'bio', 'avatar', 'phone_number')}),
        (_('Academic info'), {'fields': ('curriculum', 'grade_level', 'school')}),
        (_('Permissions'), {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'is_verified', 'groups', 'user_permissions'),
        }),
        (_('Subscription'), {'fields': ('is_premium', 'premium_expires_at')}),
        (_('Important dates'), {'fields': ('last_login', 'date_joined')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'password1', 'password2'),
        }),
    )
    
    readonly_fields = ['date_joined', 'last_login']
