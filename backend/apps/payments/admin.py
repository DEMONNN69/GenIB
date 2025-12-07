"""
Admin configuration for Payment models
"""
from django.contrib import admin
from django.utils.html import format_html
from .models import Cart, CartItem, Order, OrderItem, Payment, UserPurchase


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ['user', 'total_items', 'total_amount', 'created_at', 'updated_at']
    search_fields = ['user__email', 'user__first_name', 'user__last_name']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'created_at'

    def total_items(self, obj):
        return obj.total_items
    total_items.short_description = 'Items'

    def total_amount(self, obj):
        return f"${obj.total_amount:.2f}"
    total_amount.short_description = 'Total'


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ['cart', 'item_display', 'quantity', 'price_at_addition', 'subtotal_display', 'added_at']
    list_filter = ['added_at']
    search_fields = ['cart__user__email', 'bundle__name', 'paper__title']
    readonly_fields = ['added_at']
    
    def item_display(self, obj):
        if obj.bundle:
            return format_html('<strong>Bundle:</strong> {}', obj.bundle.name)
        return format_html('<strong>Paper:</strong> {}', obj.paper.title)
    item_display.short_description = 'Item'

    def subtotal_display(self, obj):
        return f"${obj.subtotal:.2f}"
    subtotal_display.short_description = 'Subtotal'


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['item_name', 'price', 'quantity', 'subtotal']
    can_delete = False


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = [
        'order_number',
        'user_email',
        'status_display',
        'total_amount_display',
        'payment_status_display',
        'created_at',
    ]
    list_filter = ['status', 'created_at', 'currency']
    search_fields = ['order_number', 'user__email', 'user__first_name', 'user__last_name']
    readonly_fields = ['order_number', 'created_at', 'updated_at', 'completed_at']
    date_hierarchy = 'created_at'
    inlines = [OrderItemInline]
    
    fieldsets = (
        ('Order Information', {
            'fields': ('order_number', 'user', 'status')
        }),
        ('Pricing', {
            'fields': ('subtotal', 'tax', 'discount', 'total_amount', 'currency')
        }),
        ('Additional Info', {
            'fields': ('notes', 'created_at', 'updated_at', 'completed_at')
        }),
    )

    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = 'User'
    user_email.admin_order_field = 'user__email'

    def status_display(self, obj):
        colors = {
            'pending': 'orange',
            'processing': 'blue',
            'completed': 'green',
            'failed': 'red',
            'cancelled': 'gray',
            'refunded': 'purple',
        }
        color = colors.get(obj.status, 'black')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color,
            obj.get_status_display()
        )
    status_display.short_description = 'Status'

    def total_amount_display(self, obj):
        return f"{obj.total_amount:.2f} {obj.currency}"
    total_amount_display.short_description = 'Total'
    total_amount_display.admin_order_field = 'total_amount'

    def payment_status_display(self, obj):
        if hasattr(obj, 'payment'):
            colors = {
                'pending': 'orange',
                'processing': 'blue',
                'completed': 'green',
                'failed': 'red',
                'refunded': 'purple',
                'cancelled': 'gray',
            }
            color = colors.get(obj.payment.status, 'black')
            return format_html(
                '<span style="color: {};">{}</span>',
                color,
                obj.payment.get_status_display()
            )
        return format_html('<span style="color: gray;">No Payment</span>')
    payment_status_display.short_description = 'Payment Status'


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ['order', 'item_name', 'quantity', 'price', 'subtotal']
    list_filter = ['order__created_at']
    search_fields = ['order__order_number', 'item_name']


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = [
        'transaction_id',
        'order_number',
        'payment_method_display',
        'status_display',
        'amount_display',
        'created_at',
    ]
    list_filter = ['payment_method', 'status', 'created_at']
    search_fields = ['transaction_id', 'payment_intent_id', 'order__order_number']
    readonly_fields = [
        'transaction_id',
        'payment_intent_id',
        'gateway_response',
        'created_at',
        'updated_at',
        'completed_at'
    ]
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Payment Information', {
            'fields': ('order', 'payment_method', 'status')
        }),
        ('Gateway Details', {
            'fields': ('transaction_id', 'payment_intent_id', 'amount', 'currency')
        }),
        ('Response Data', {
            'fields': ('gateway_response', 'error_message'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'completed_at')
        }),
    )

    def order_number(self, obj):
        return obj.order.order_number
    order_number.short_description = 'Order'
    order_number.admin_order_field = 'order__order_number'

    def payment_method_display(self, obj):
        return obj.get_payment_method_display()
    payment_method_display.short_description = 'Method'

    def status_display(self, obj):
        colors = {
            'pending': 'orange',
            'processing': 'blue',
            'completed': 'green',
            'failed': 'red',
            'refunded': 'purple',
            'cancelled': 'gray',
        }
        color = colors.get(obj.status, 'black')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color,
            obj.get_status_display()
        )
    status_display.short_description = 'Status'

    def amount_display(self, obj):
        return f"${obj.amount:.2f} {obj.currency}"
    amount_display.short_description = 'Amount'


@admin.register(UserPurchase)
class UserPurchaseAdmin(admin.ModelAdmin):
    list_display = [
        'user_email',
        'item_display',
        'purchase_price_display',
        'purchased_at',
        'access_status_display',
    ]
    list_filter = ['is_active', 'purchased_at']
    search_fields = [
        'user__email',
        'user__first_name',
        'user__last_name',
        'bundle__name',
        'paper__title',
        'order__order_number'
    ]
    readonly_fields = ['purchased_at']
    date_hierarchy = 'purchased_at'
    
    fieldsets = (
        ('Purchase Information', {
            'fields': ('user', 'bundle', 'paper', 'order')
        }),
        ('Access Control', {
            'fields': ('purchase_price', 'purchased_at', 'expires_at', 'is_active')
        }),
    )

    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = 'User'
    user_email.admin_order_field = 'user__email'

    def item_display(self, obj):
        if obj.bundle:
            return format_html('<strong>Bundle:</strong> {}', obj.bundle.name)
        return format_html('<strong>Paper:</strong> {}', obj.paper.title)
    item_display.short_description = 'Item'

    def purchase_price_display(self, obj):
        return f"${obj.purchase_price:.2f}"
    purchase_price_display.short_description = 'Price'
    purchase_price_display.admin_order_field = 'purchase_price'

    def access_status_display(self, obj):
        if obj.has_access():
            return format_html('<span style="color: green; font-weight: bold;">✓ Active</span>')
        return format_html('<span style="color: red;">✗ No Access</span>')
    access_status_display.short_description = 'Access'
