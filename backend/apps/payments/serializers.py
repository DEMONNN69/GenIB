"""
Serializers for Payment App
"""
from rest_framework import serializers
from .models import Cart, CartItem, Order, OrderItem, Payment, UserPurchase
from apps.papers.serializers import BundleListSerializer, PaperListSerializer


class CartItemSerializer(serializers.ModelSerializer):
    """Serializer for cart items"""
    bundle_details = BundleListSerializer(source='bundle', read_only=True)
    paper_details = PaperListSerializer(source='paper', read_only=True)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    item_name = serializers.SerializerMethodField()
    item_type = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = [
            'id',
            'bundle',
            'paper',
            'bundle_details',
            'paper_details',
            'quantity',
            'price_at_addition',
            'subtotal',
            'item_name',
            'item_type',
            'added_at',
        ]
        read_only_fields = ['id', 'price_at_addition', 'added_at']

    def get_item_name(self, obj):
        """Get the name of the item"""
        return obj.bundle.name if obj.bundle else obj.paper.title

    def get_item_type(self, obj):
        """Get the type of item (bundle or paper)"""
        return 'bundle' if obj.bundle else 'paper'

    def validate(self, data):
        """Validate that either bundle or paper is provided, not both"""
        bundle = data.get('bundle')
        paper = data.get('paper')

        if bundle and paper:
            raise serializers.ValidationError("Cannot add both bundle and paper to cart")
        if not bundle and not paper:
            raise serializers.ValidationError("Must provide either bundle or paper")

        # Set price at addition
        if bundle:
            if not bundle.is_paid:
                raise serializers.ValidationError("Cannot add free bundle to cart")
            data['price_at_addition'] = bundle.price
        elif paper:
            if not paper.is_premium:
                raise serializers.ValidationError("Cannot add free paper to cart")
            # Assuming papers have a price field, or default to 0
            data['price_at_addition'] = getattr(paper, 'price', 0)

        return data


class CartSerializer(serializers.ModelSerializer):
    """Serializer for shopping cart"""
    items = CartItemSerializer(many=True, read_only=True)
    total_items = serializers.IntegerField(read_only=True)
    total_amount = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Cart
        fields = [
            'id',
            'user',
            'items',
            'total_items',
            'total_amount',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class OrderItemSerializer(serializers.ModelSerializer):
    """Serializer for order items"""
    bundle_details = BundleListSerializer(source='bundle', read_only=True)
    paper_details = PaperListSerializer(source='paper', read_only=True)
    item_type = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = [
            'id',
            'bundle',
            'paper',
            'bundle_details',
            'paper_details',
            'item_name',
            'price',
            'quantity',
            'subtotal',
            'item_type',
        ]

    def get_item_type(self, obj):
        """Get the type of item (bundle or paper)"""
        return 'bundle' if obj.bundle else 'paper'


class OrderListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing orders"""
    total_items = serializers.IntegerField(read_only=True)
    payment_status = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            'id',
            'order_number',
            'status',
            'total_amount',
            'currency',
            'total_items',
            'payment_status',
            'created_at',
            'completed_at',
        ]

    def get_payment_status(self, obj):
        """Get payment status if payment exists"""
        if hasattr(obj, 'payment'):
            return obj.payment.status
        return None


class OrderDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for orders"""
    items = OrderItemSerializer(many=True, read_only=True)
    total_items = serializers.IntegerField(read_only=True)
    payment = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            'id',
            'order_number',
            'status',
            'subtotal',
            'tax',
            'discount',
            'total_amount',
            'currency',
            'items',
            'total_items',
            'payment',
            'notes',
            'created_at',
            'updated_at',
            'completed_at',
        ]

    def get_payment(self, obj):
        """Get payment details if exists"""
        if hasattr(obj, 'payment'):
            return {
                'id': obj.payment.id,
                'payment_method': obj.payment.payment_method,
                'status': obj.payment.status,
                'transaction_id': obj.payment.transaction_id,
                'created_at': obj.payment.created_at,
                'completed_at': obj.payment.completed_at,
            }
        return None


class CreateOrderSerializer(serializers.Serializer):
    """Serializer for creating an order from cart"""
    notes = serializers.CharField(required=False, allow_blank=True)
    payment_method = serializers.ChoiceField(
        choices=['stripe', 'paypal', 'razorpay'],
        required=True
    )


class PaymentSerializer(serializers.ModelSerializer):
    """Serializer for payments"""
    order_number = serializers.CharField(source='order.order_number', read_only=True)

    class Meta:
        model = Payment
        fields = [
            'id',
            'order',
            'order_number',
            'payment_method',
            'status',
            'transaction_id',
            'payment_intent_id',
            'amount',
            'currency',
            'error_message',
            'created_at',
            'updated_at',
            'completed_at',
        ]
        read_only_fields = [
            'id',
            'transaction_id',
            'payment_intent_id',
            'created_at',
            'updated_at',
            'completed_at',
        ]


class UserPurchaseSerializer(serializers.ModelSerializer):
    """Serializer for user purchases"""
    bundle_details = BundleListSerializer(source='bundle', read_only=True)
    paper_details = PaperListSerializer(source='paper', read_only=True)
    order_number = serializers.CharField(source='order.order_number', read_only=True)
    item_name = serializers.SerializerMethodField()
    item_type = serializers.SerializerMethodField()
    has_access = serializers.SerializerMethodField()

    class Meta:
        model = UserPurchase
        fields = [
            'id',
            'bundle',
            'paper',
            'bundle_details',
            'paper_details',
            'order_number',
            'item_name',
            'item_type',
            'purchase_price',
            'purchased_at',
            'expires_at',
            'is_active',
            'has_access',
        ]

    def get_item_name(self, obj):
        """Get the name of the purchased item"""
        return obj.bundle.name if obj.bundle else obj.paper.title

    def get_item_type(self, obj):
        """Get the type of purchased item"""
        return 'bundle' if obj.bundle else 'paper'

    def get_has_access(self, obj):
        """Check if user still has access"""
        return obj.has_access()
