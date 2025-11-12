"""
URL patterns for Payments API
"""
from django.urls import path
from .views import (
    CartView,
    CartItemDetailView,
    OrderListView,
    OrderDetailView,
    ConfirmPaymentView,
    UserPurchasesView,
    CheckPurchaseView,
)

app_name = 'payments'

urlpatterns = [
    # Cart endpoints
    path('cart/', CartView.as_view(), name='cart'),
    path('cart/items/<int:item_id>/', CartItemDetailView.as_view(), name='cart-item-detail'),
    
    # Order endpoints
    path('orders/', OrderListView.as_view(), name='order-list'),
    path('orders/<int:order_id>/', OrderDetailView.as_view(), name='order-detail'),
    
    # Payment endpoints
    path('payment/confirm/', ConfirmPaymentView.as_view(), name='payment-confirm'),
    
    # Purchase endpoints
    path('purchases/', UserPurchasesView.as_view(), name='user-purchases'),
    path('purchases/check/', CheckPurchaseView.as_view(), name='check-purchase'),
]
