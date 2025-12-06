"""
Payment Views - Cart, Orders, Payments, and Purchases
"""
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from django.shortcuts import get_object_or_404
from decimal import Decimal

from .models import Cart, CartItem, Order, OrderItem, Payment, UserPurchase
from .serializers import (
    CartSerializer, CartItemSerializer,
    OrderListSerializer, OrderDetailSerializer, CreateOrderSerializer,
    PaymentSerializer, UserPurchaseSerializer
)
from .services import PaymentService
from apps.papers.models import Bundle, Paper

import logging

logger = logging.getLogger(__name__)


class CartView(APIView):
    """
    GET: Get user's cart
    POST: Add item to cart
    DELETE: Clear cart
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get user's shopping cart"""
        cart, created = Cart.objects.get_or_create(user=request.user)
        serializer = CartSerializer(cart)
        return Response({
            'success': True,
            'data': serializer.data
        }, status=status.HTTP_200_OK)

    def post(self, request):
        """Add item to cart"""
        cart, created = Cart.objects.get_or_create(user=request.user)
        
        bundle_id = request.data.get('bundle_id')
        paper_id = request.data.get('paper_id')
        quantity = request.data.get('quantity', 1)

        try:
            with transaction.atomic():
                data = {'cart': cart.id, 'quantity': quantity}
                
                if bundle_id:
                    bundle = get_object_or_404(Bundle, id=bundle_id, is_active=True)
                    
                    if not bundle.is_paid:
                        return Response({
                            'success': False,
                            'message': 'Cannot add free bundle to cart'
                        }, status=status.HTTP_400_BAD_REQUEST)
                    
                    # Check if already in cart
                    cart_item, item_created = CartItem.objects.get_or_create(
                        cart=cart,
                        bundle=bundle,
                        defaults={'price_at_addition': bundle.price, 'quantity': quantity}
                    )
                    
                    if not item_created:
                        cart_item.quantity += int(quantity)
                        cart_item.save()
                
                elif paper_id:
                    paper = get_object_or_404(Paper, id=paper_id, is_active=True)
                    
                    if not paper.is_premium:
                        return Response({
                            'success': False,
                            'message': 'Cannot add free paper to cart'
                        }, status=status.HTTP_400_BAD_REQUEST)
                    
                    # Get paper price (assuming you'll add price field to Paper model)
                    paper_price = getattr(paper, 'price', Decimal('0.00'))
                    
                    cart_item, item_created = CartItem.objects.get_or_create(
                        cart=cart,
                        paper=paper,
                        defaults={'price_at_addition': paper_price, 'quantity': quantity}
                    )
                    
                    if not item_created:
                        cart_item.quantity += int(quantity)
                        cart_item.save()
                
                else:
                    return Response({
                        'success': False,
                        'message': 'Must provide bundle_id or paper_id'
                    }, status=status.HTTP_400_BAD_REQUEST)

                cart.refresh_from_db()
                serializer = CartSerializer(cart)
                return Response({
                    'success': True,
                    'message': 'Item added to cart',
                    'data': serializer.data
                }, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f"Error adding item to cart: {str(e)}")
            return Response({
                'success': False,
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request):
        """Clear entire cart"""
        try:
            cart = get_object_or_404(Cart, user=request.user)
            cart.clear()
            return Response({
                'success': True,
                'message': 'Cart cleared successfully'
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'success': False,
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class CartItemDetailView(APIView):
    """
    PATCH: Update cart item quantity
    DELETE: Remove item from cart
    """
    permission_classes = [IsAuthenticated]

    def patch(self, request, item_id):
        """Update cart item quantity"""
        try:
            cart_item = get_object_or_404(
                CartItem,
                id=item_id,
                cart__user=request.user
            )
            
            quantity = request.data.get('quantity')
            if quantity:
                cart_item.quantity = int(quantity)
                cart_item.save()

            serializer = CartItemSerializer(cart_item)
            return Response({
                'success': True,
                'message': 'Cart item updated',
                'data': serializer.data
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                'success': False,
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, item_id):
        """Remove item from cart"""
        try:
            cart_item = get_object_or_404(
                CartItem,
                id=item_id,
                cart__user=request.user
            )
            cart_item.delete()
            
            return Response({
                'success': True,
                'message': 'Item removed from cart'
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                'success': False,
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class OrderListView(APIView):
    """
    GET: List user's orders
    POST: Create order from cart
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get user's order history"""
        orders = Order.objects.filter(user=request.user).prefetch_related('items')
        serializer = OrderListSerializer(orders, many=True)
        
        return Response({
            'success': True,
            'data': serializer.data,
            'count': orders.count()
        }, status=status.HTTP_200_OK)

    def post(self, request):
        """Create order from cart"""
        serializer = CreateOrderSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response({
                'success': False,
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            cart = get_object_or_404(Cart, user=request.user)
            
            if cart.items.count() == 0:
                return Response({
                    'success': False,
                    'message': 'Cart is empty'
                }, status=status.HTTP_400_BAD_REQUEST)

            with transaction.atomic():
                # Calculate totals
                subtotal = cart.total_amount
                tax = Decimal('0.00')  # Add tax calculation if needed
                discount = Decimal('0.00')  # Add discount logic if needed
                total = subtotal + tax - discount

                # Create order
                order = Order.objects.create(
                    user=request.user,
                    status='pending',
                    subtotal=subtotal,
                    tax=tax,
                    discount=discount,
                    total_amount=total,
                    currency='USD',  # Make this configurable
                    notes=serializer.validated_data.get('notes', '')
                )

                # Create order items from cart items
                for cart_item in cart.items.all():
                    OrderItem.objects.create(
                        order=order,
                        bundle=cart_item.bundle,
                        paper=cart_item.paper,
                        item_name=cart_item.bundle.name if cart_item.bundle else cart_item.paper.title,
                        price=cart_item.price_at_addition,
                        quantity=cart_item.quantity,
                        subtotal=cart_item.subtotal
                    )

                # Create payment record
                payment_method = serializer.validated_data.get('payment_method')
                payment = Payment.objects.create(
                    order=order,
                    payment_method=payment_method,
                    status='pending',
                    amount=total,
                    currency='USD'
                )

                # Initialize payment with gateway
                if payment_method == 'stripe':
                    payment_data = PaymentService.create_payment_intent_stripe(order)
                    payment.payment_intent_id = payment_data['payment_intent_id']
                    payment.save()
                    
                    response_data = {
                        'id': order.id,
                        'order_id': order.id,
                        'order_number': order.order_number,
                        'total_amount': str(total),
                        'currency': order.currency,
                        'stripe_client_secret': payment_data['client_secret'],
                        'stripe_payment_intent_id': payment_data['payment_intent_id']
                    }
                
                elif payment_method == 'razorpay':
                    payment_data = PaymentService.create_payment_intent_razorpay(order)
                    payment.payment_intent_id = payment_data['order_id']
                    payment.save()
                    
                    response_data = {
                        'id': order.id,
                        'order_id': order.id,
                        'order_number': order.order_number,
                        'total_amount': str(total),
                        'currency': order.currency,
                        'razorpay_order_id': payment_data['order_id'],
                        'razorpay_key_id': payment_data['key_id']
                    }
                
                else:
                    response_data = {
                        'id': order.id,
                        'order_id': order.id,
                        'order_number': order.order_number,
                        'total_amount': str(total),
                        'currency': order.currency
                    }

                return Response({
                    'success': True,
                    'message': 'Order created successfully',
                    'data': response_data
                }, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f"Error creating order: {str(e)}")
            return Response({
                'success': False,
                'message': f'Failed to create order: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)


class OrderDetailView(APIView):
    """
    GET: Get order details
    PATCH: Cancel order (if pending)
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, order_id):
        """Get order details"""
        order = get_object_or_404(
            Order,
            id=order_id,
            user=request.user
        )
        serializer = OrderDetailSerializer(order)
        
        return Response({
            'success': True,
            'data': serializer.data
        }, status=status.HTTP_200_OK)

    def patch(self, request, order_id):
        """Cancel order if pending"""
        order = get_object_or_404(
            Order,
            id=order_id,
            user=request.user
        )

        if order.status != 'pending':
            return Response({
                'success': False,
                'message': 'Only pending orders can be cancelled'
            }, status=status.HTTP_400_BAD_REQUEST)

        order.status = 'cancelled'
        order.save()

        if hasattr(order, 'payment'):
            order.payment.status = 'cancelled'
            order.payment.save()

        return Response({
            'success': True,
            'message': 'Order cancelled successfully'
        }, status=status.HTTP_200_OK)


class ConfirmPaymentView(APIView):
    """
    POST: Confirm payment completion
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Confirm payment after gateway confirmation"""
        order_id = request.data.get('order_id')
        payment_method = request.data.get('payment_method')

        try:
            order = get_object_or_404(
                Order,
                id=order_id,
                user=request.user
            )
            
            payment = get_object_or_404(Payment, order=order)

            # Verify with payment gateway
            if payment_method == 'stripe':
                stripe_payment_intent_id = request.data.get('stripe_payment_intent_id')
                verification = PaymentService.verify_stripe_payment(stripe_payment_intent_id)
                
            elif payment_method == 'razorpay':
                razorpay_payment_id = request.data.get('razorpay_payment_id')
                razorpay_order_id = request.data.get('razorpay_order_id')
                razorpay_signature = request.data.get('razorpay_signature')
                
                verification = PaymentService.verify_razorpay_payment(
                    razorpay_payment_id,
                    razorpay_order_id,
                    razorpay_signature
                )
            else:
                return Response({
                    'success': False,
                    'message': 'Invalid payment method'
                }, status=status.HTTP_400_BAD_REQUEST)

            if verification.get('success'):
                payment.transaction_id = verification.get('transaction_id')
                payment.status = 'completed'
                payment.gateway_response = verification
                payment.save()

                # Update order status
                order.status = 'completed'
                order.save()

                return Response({
                    'success': True,
                    'message': 'Payment confirmed successfully',
                    'data': {
                        'order_id': order.id,
                        'order_number': order.order_number,
                        'amount': float(payment.amount),
                        'status': payment.status
                    }
                }, status=status.HTTP_200_OK)
            else:
                payment.mark_failed(verification.get('error', 'Payment verification failed'))
                return Response({
                    'success': False,
                    'message': verification.get('error', 'Payment verification failed')
                }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            logger.error(f"Error confirming payment: {str(e)}")
            return Response({
                'success': False,
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class UserPurchasesView(APIView):
    """
    GET: List user's purchases
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get user's purchase history"""
        purchases = UserPurchase.objects.filter(
            user=request.user,
            is_active=True
        ).select_related('bundle', 'paper', 'order')

        serializer = UserPurchaseSerializer(purchases, many=True)
        
        return Response({
            'success': True,
            'data': serializer.data,
            'count': purchases.count()
        }, status=status.HTTP_200_OK)


class CheckPurchaseView(APIView):
    """
    GET: Check if user has purchased a specific item
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Check purchase status"""
        bundle_id = request.query_params.get('bundle_id')
        paper_id = request.query_params.get('paper_id')

        try:
            if bundle_id:
                purchase = UserPurchase.objects.filter(
                    user=request.user,
                    bundle_id=bundle_id,
                    is_active=True
                ).first()
            elif paper_id:
                purchase = UserPurchase.objects.filter(
                    user=request.user,
                    paper_id=paper_id,
                    is_active=True
                ).first()
            else:
                return Response({
                    'success': False,
                    'message': 'Must provide bundle_id or paper_id'
                }, status=status.HTTP_400_BAD_REQUEST)

            if purchase and purchase.has_access():
                return Response({
                    'success': True,
                    'has_purchased': True,
                    'purchase_date': purchase.purchased_at
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'success': True,
                    'has_purchased': False
                }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                'success': False,
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
