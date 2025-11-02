"""
URL patterns for Filter Types and Options
"""

from django.urls import path
from .views import (
    FilterTypeListView,
    FilterTypeDetailView,
    FilterTypeBySlugView,
    FilterOptionSearchView,
)

app_name = 'filters'

urlpatterns = [
    # Filter Type endpoints
    path('types/', FilterTypeListView.as_view(), name='filter-type-list'),
    path('types/<int:type_id>/', FilterTypeDetailView.as_view(), name='filter-type-detail'),
    path('types/<slug:slug>/options/', FilterTypeBySlugView.as_view(), name='filter-type-by-slug'),
    
    # Filter Option endpoints
    path('options/search/', FilterOptionSearchView.as_view(), name='filter-option-search'),
]
