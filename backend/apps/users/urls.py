"""
URL patterns for Users app
"""

from django.urls import path
from .views import (
    UserProfileView,
    UserDetailView,
    UserDeactivateView,
    UserSearchView
)

app_name = 'users'

urlpatterns = [
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('profile/deactivate/', UserDeactivateView.as_view(), name='user-deactivate'),
    path('search/', UserSearchView.as_view(), name='user-search'),
    path('<int:user_id>/', UserDetailView.as_view(), name='user-detail'),
]
