"""
Payment Models for Cart, Orders, Payments, and User Purchases
"""
from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator
from decimal import Decimal
import uuid
from datetime import datetime

User = get_user_model()


class Cart(models.Model):
    """Shopping cart for users"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='cart')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'carts'
        verbose_name = 'Cart'
        verbose_name_plural = 'Carts'

    def __str__(self):
        return f"Cart for {self.user.email}"

    @property
    def total_items(self):
        """Total number of items in cart"""
        return self.items.count()

    @property
    def total_amount(self):
        """Total amount of all items in cart"""
        return sum(item.subtotal for item in self.items.all())

    def clear(self):
        """Remove all items from cart"""
        self.items.all().delete()


class CartItem(models.Model):
    """Individual items in shopping cart"""
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    bundle = models.ForeignKey('papers.Bundle', on_delete=models.CASCADE, null=True, blank=True)
    paper = models.ForeignKey('papers.Paper', on_delete=models.CASCADE, null=True, blank=True)
    quantity = models.PositiveIntegerField(default=1, validators=[MinValueValidator(1)])
    price_at_addition = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Price when item was added to cart"
    )
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'cart_items'
        verbose_name = 'Cart Item'
        verbose_name_plural = 'Cart Items'
        unique_together = [['cart', 'bundle'], ['cart', 'paper']]

    def __str__(self):
        item_name = self.bundle.name if self.bundle else self.paper.title
        return f"{item_name} in {self.cart.user.email}'s cart"

    @property
    def subtotal(self):
        """Calculate subtotal for this item"""
        return self.price_at_addition * self.quantity

    def clean(self):
        """Validate that either bundle or paper is set, not both"""
        from django.core.exceptions import ValidationError
        if self.bundle and self.paper:
            raise ValidationError("Cart item cannot have both bundle and paper")
        if not self.bundle and not self.paper:
            raise ValidationError("Cart item must have either bundle or paper")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)


class Order(models.Model):
    """Customer orders"""
    ORDER_STATUS = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
        ('refunded', 'Refunded'),
    ]

    CURRENCY_CHOICES = [
        ('USD', 'US Dollar'),
        ('EUR', 'Euro'),
        ('GBP', 'British Pound'),
        ('INR', 'Indian Rupee'),
    ]

    user = models.ForeignKey(User, on_delete=models.PROTECT, related_name='orders')
    order_number = models.CharField(max_length=50, unique=True, editable=False)
    status = models.CharField(max_length=20, choices=ORDER_STATUS, default='pending')
    
    # Pricing
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    tax = models.DecimalField(max_digits=10, decimal_places=2, default=0, validators=[MinValueValidator(0)])
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=0, validators=[MinValueValidator(0)])
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    currency = models.CharField(max_length=3, choices=CURRENCY_CHOICES, default='USD')
    
    # Metadata
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'orders'
        verbose_name = 'Order'
        verbose_name_plural = 'Orders'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f"Order {self.order_number} - {self.user.email}"

    def save(self, *args, **kwargs):
        if not self.order_number:
            self.order_number = self.generate_order_number()
        super().save(*args, **kwargs)

    @staticmethod
    def generate_order_number():
        """Generate unique order number"""
        timestamp = datetime.now().strftime('%Y%m%d')
        unique_id = str(uuid.uuid4().hex[:8]).upper()
        return f"ORD-{timestamp}-{unique_id}"

    @property
    def total_items(self):
        """Total number of items in order"""
        return sum(item.quantity for item in self.items.all())

    def mark_completed(self):
        """Mark order as completed"""
        self.status = 'completed'
        self.completed_at = datetime.now()
        self.save(update_fields=['status', 'completed_at', 'updated_at'])


class OrderItem(models.Model):
    """Items in an order"""
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    bundle = models.ForeignKey('papers.Bundle', on_delete=models.PROTECT, null=True, blank=True)
    paper = models.ForeignKey('papers.Paper', on_delete=models.PROTECT, null=True, blank=True)
    
    # Store pricing at time of purchase
    item_name = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField(default=1, validators=[MinValueValidator(1)])
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        db_table = 'order_items'
        verbose_name = 'Order Item'
        verbose_name_plural = 'Order Items'

    def __str__(self):
        return f"{self.item_name} - Order {self.order.order_number}"

    def clean(self):
        """Validate that either bundle or paper is set, not both"""
        from django.core.exceptions import ValidationError
        if self.bundle and self.paper:
            raise ValidationError("Order item cannot have both bundle and paper")
        if not self.bundle and not self.paper:
            raise ValidationError("Order item must have either bundle or paper")

    def save(self, *args, **kwargs):
        # Auto-calculate subtotal
        if not self.subtotal:
            self.subtotal = self.price * self.quantity
        
        # Auto-set item name
        if not self.item_name:
            self.item_name = self.bundle.name if self.bundle else self.paper.title
        
        self.full_clean()
        super().save(*args, **kwargs)


class Payment(models.Model):
    """Payment transactions"""
    PAYMENT_METHOD = [
        ('stripe', 'Stripe'),
        ('paypal', 'PayPal'),
        ('razorpay', 'Razorpay'),
        ('manual', 'Manual'),
    ]

    PAYMENT_STATUS = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
        ('cancelled', 'Cancelled'),
    ]

    order = models.OneToOneField(Order, on_delete=models.PROTECT, related_name='payment')
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD)
    status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default='pending')
    
    # Payment gateway details
    transaction_id = models.CharField(max_length=255, unique=True, null=True, blank=True)
    payment_intent_id = models.CharField(max_length=255, null=True, blank=True)
    
    # Amount
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='USD')
    
    # Gateway response
    gateway_response = models.JSONField(default=dict, blank=True)
    error_message = models.TextField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'payments'
        verbose_name = 'Payment'
        verbose_name_plural = 'Payments'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['transaction_id']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f"Payment {self.transaction_id or 'Pending'} - {self.order.order_number}"

    def mark_completed(self):
        """Mark payment as completed"""
        self.status = 'completed'
        self.completed_at = datetime.now()
        self.save(update_fields=['status', 'completed_at', 'updated_at'])

    def mark_failed(self, error_message=''):
        """Mark payment as failed"""
        self.status = 'failed'
        self.error_message = error_message
        self.save(update_fields=['status', 'error_message', 'updated_at'])


class UserPurchase(models.Model):
    """Track user's purchased items for access control"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='purchases')
    bundle = models.ForeignKey('papers.Bundle', on_delete=models.PROTECT, null=True, blank=True)
    paper = models.ForeignKey('papers.Paper', on_delete=models.PROTECT, null=True, blank=True)
    order = models.ForeignKey(Order, on_delete=models.PROTECT, related_name='purchases')
    
    # Access control
    purchased_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True, help_text="For time-limited access")
    is_active = models.BooleanField(default=True)
    
    # Price at purchase
    purchase_price = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        db_table = 'user_purchases'
        verbose_name = 'User Purchase'
        verbose_name_plural = 'User Purchases'
        ordering = ['-purchased_at']
        unique_together = [['user', 'bundle'], ['user', 'paper']]
        indexes = [
            models.Index(fields=['user', 'is_active']),
            models.Index(fields=['bundle', 'is_active']),
            models.Index(fields=['paper', 'is_active']),
        ]

    def __str__(self):
        item_name = self.bundle.name if self.bundle else self.paper.title
        return f"{self.user.email} - {item_name}"

    def clean(self):
        """Validate that either bundle or paper is set, not both"""
        from django.core.exceptions import ValidationError
        if self.bundle and self.paper:
            raise ValidationError("Purchase cannot have both bundle and paper")
        if not self.bundle and not self.paper:
            raise ValidationError("Purchase must have either bundle or paper")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def has_access(self):
        """Check if user still has access"""
        if not self.is_active:
            return False
        if self.expires_at and datetime.now() > self.expires_at:
            return False
        return True
