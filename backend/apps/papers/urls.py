"""
URL patterns for Papers and Categories
"""

from django.urls import path
from .views import (
    CategoryListView,
    CategoryDetailView,
    CategoryTreeView,
    CategorySubcategoriesView,
    CategorySearchView,
)

app_name = 'papers'

urlpatterns = [
    # Category endpoints
    path('categories/', CategoryListView.as_view(), name='category-list'),
    path('categories/tree/', CategoryTreeView.as_view(), name='category-tree'),
    path('categories/search/', CategorySearchView.as_view(), name='category-search'),
    path('categories/<int:category_id>/', CategoryDetailView.as_view(), name='category-detail'),
    path('categories/<int:category_id>/subcategories/', CategorySubcategoriesView.as_view(), name='category-subcategories'),
]
