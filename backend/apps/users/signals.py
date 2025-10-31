"""
Signals for Users app
"""

from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User


@receiver(post_save, sender=User)
def user_post_save(sender, instance, created, **kwargs):
    """
    Signal handler for post-save events on User model
    """
    if created:
        # Perform actions when a new user is created
        # e.g., send welcome email, create user profile, etc.
        pass
