"""
Signals for Payment App
Handle post-payment actions like creating user purchases
"""
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Payment, UserPurchase, Order
import logging

logger = logging.getLogger(__name__)


@receiver(post_save, sender=Payment)
def handle_payment_completion(sender, instance, created, **kwargs):
    """
    Handle actions after payment is completed
    Create UserPurchase records for access control
    """
    # Only process when payment status changes to completed
    if instance.status == 'completed' and instance.order.status != 'completed':
        try:
            order = instance.order
            
            # Mark order as completed
            order.mark_completed()
            
            # Create UserPurchase records for each order item
            for item in order.items.all():
                # Check if purchase already exists
                if item.bundle:
                    existing = UserPurchase.objects.filter(
                        user=order.user,
                        bundle=item.bundle
                    ).first()
                    
                    if not existing:
                        UserPurchase.objects.create(
                            user=order.user,
                            bundle=item.bundle,
                            order=order,
                            purchase_price=item.price,
                            is_active=True
                        )
                        logger.info(f"Created purchase record for user {order.user.id} - bundle {item.bundle.id}")
                
                elif item.paper:
                    existing = UserPurchase.objects.filter(
                        user=order.user,
                        paper=item.paper
                    ).first()
                    
                    if not existing:
                        UserPurchase.objects.create(
                            user=order.user,
                            paper=item.paper,
                            order=order,
                            purchase_price=item.price,
                            is_active=True
                        )
                        logger.info(f"Created purchase record for user {order.user.id} - paper {item.paper.id}")
            
            # Clear user's cart after successful purchase
            if hasattr(order.user, 'cart'):
                order.user.cart.clear()
                logger.info(f"Cleared cart for user {order.user.id}")
            
            logger.info(f"Payment {instance.id} processed successfully for order {order.order_number}")
            
        except Exception as e:
            logger.error(f"Error processing payment completion: {str(e)}")


@receiver(post_save, sender=Order)
def create_order_notification(sender, instance, created, **kwargs):
    """
    Send notification when order is created or status changes
    This can be extended to send emails, SMS, etc.
    """
    if created:
        logger.info(f"New order created: {instance.order_number} for user {instance.user.email}")
        # TODO: Send order confirmation email
    
    elif instance.status == 'completed':
        logger.info(f"Order completed: {instance.order_number}")
        # TODO: Send purchase confirmation email with download links
    
    elif instance.status == 'failed':
        logger.warning(f"Order failed: {instance.order_number}")
        # TODO: Send failure notification email
