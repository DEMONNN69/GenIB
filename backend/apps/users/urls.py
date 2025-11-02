"""
URL patterns for Users app
"""

from django.urls import path
from .views import (
    UserProfileView,
    UserDetailView,
    UserDeactivateView,
    UserSearchView,
    UserFavoritesListView,
    ToggleFavoriteView,
    CheckFavoriteView
)

app_name = 'users'

urlpatterns = [
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('profile/deactivate/', UserDeactivateView.as_view(), name='user-deactivate'),
    path('search/', UserSearchView.as_view(), name='user-search'),
    path('<int:user_id>/', UserDetailView.as_view(), name='user-detail'),
    
    # Favorites endpoints
    path('favorites/', UserFavoritesListView.as_view(), name='user-favorites'),
    path('favorites/toggle/', ToggleFavoriteView.as_view(), name='toggle-favorite'),
    path('favorites/check/<int:paper_id>/', CheckFavoriteView.as_view(), name='check-favorite'),
]
