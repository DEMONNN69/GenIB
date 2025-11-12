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
    PaperListView,
    PaperDetailView,
    PaperDownloadView,
    PaperSearchView,
    PaperFileView,
    BundleListView,
    BundleDetailView,
    BundlePapersView,
    BundleFileView,
)

app_name = 'papers'

urlpatterns = [
    # Category endpoints
    path('categories/', CategoryListView.as_view(), name='category-list'),
    path('categories/tree/', CategoryTreeView.as_view(), name='category-tree'),
    path('categories/search/', CategorySearchView.as_view(), name='category-search'),
    path('categories/<int:category_id>/', CategoryDetailView.as_view(), name='category-detail'),
    path('categories/<int:category_id>/subcategories/', CategorySubcategoriesView.as_view(), name='category-subcategories'),
    
    # Paper endpoints
    path('papers/', PaperListView.as_view(), name='paper-list'),
    path('papers/search/', PaperSearchView.as_view(), name='paper-search'),
    path('papers/<int:paper_id>/', PaperDetailView.as_view(), name='paper-detail'),
    path('papers/<int:paper_id>/download/', PaperDownloadView.as_view(), name='paper-download'),
    path('papers/<int:paper_id>/file/', PaperFileView.as_view(), name='paper-file'),
    
    # Bundle endpoints
    path('bundles/', BundleListView.as_view(), name='bundle-list'),
    path('bundles/<int:bundle_id>/', BundleDetailView.as_view(), name='bundle-detail'),
    path('bundles/<int:bundle_id>/papers/', BundlePapersView.as_view(), name='bundle-papers'),
    path('bundles/<int:bundle_id>/file/', BundleFileView.as_view(), name='bundle-file'),
]

