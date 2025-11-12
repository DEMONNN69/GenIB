"""
Payment Gateway Service
Handles integration with payment providers (Stripe, PayPal, Razorpay)
"""
from decimal import Decimal
from django.conf import settings
from .models import Payment, Order
import logging

logger = logging.getLogger(__name__)


class PaymentService:
    """Service for handling payment operations"""

    @staticmethod
    def create_payment_intent_stripe(order: Order) -> dict:
        """
        Create Stripe Payment Intent
        
        Args:
            order: Order instance
            
        Returns:
            dict with client_secret and payment_intent_id
        """
        try:
            import stripe
            stripe.api_key = settings.STRIPE_SECRET_KEY

            # Convert to cents (Stripe requires amount in smallest currency unit)
            amount_cents = int(order.total_amount * 100)

            intent = stripe.PaymentIntent.create(
                amount=amount_cents,
                currency=order.currency.lower(),
                metadata={
                    'order_id': order.id,
                    'order_number': order.order_number,
                    'user_id': order.user.id,
                    'user_email': order.user.email,
                },
                description=f"Order {order.order_number}",
            )

            return {
                'client_secret': intent.client_secret,
                'payment_intent_id': intent.id,
                'amount': order.total_amount,
                'currency': order.currency,
            }

        except Exception as e:
            logger.error(f"Stripe payment intent creation failed: {str(e)}")
            raise Exception(f"Payment initialization failed: {str(e)}")

    @staticmethod
    def create_payment_intent_razorpay(order: Order) -> dict:
        """
        Create Razorpay Order
        
        Args:
            order: Order instance
            
        Returns:
            dict with order_id and other details
        """
        try:
            import razorpay
            client = razorpay.Client(
                auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
            )

            # Razorpay requires amount in paise (smallest currency unit)
            amount_paise = int(order.total_amount * 100)

            razorpay_order = client.order.create({
                'amount': amount_paise,
                'currency': order.currency,
                'notes': {
                    'order_id': order.id,
                    'order_number': order.order_number,
                    'user_id': order.user.id,
                    'user_email': order.user.email,
                }
            })

            return {
                'order_id': razorpay_order['id'],
                'amount': order.total_amount,
                'currency': order.currency,
                'key_id': settings.RAZORPAY_KEY_ID,
            }

        except Exception as e:
            logger.error(f"Razorpay order creation failed: {str(e)}")
            raise Exception(f"Payment initialization failed: {str(e)}")

    @staticmethod
    def verify_stripe_payment(payment_intent_id: str) -> dict:
        """
        Verify Stripe payment status
        
        Args:
            payment_intent_id: Stripe Payment Intent ID
            
        Returns:
            dict with payment status and details
        """
        try:
            import stripe
            stripe.api_key = settings.STRIPE_SECRET_KEY

            intent = stripe.PaymentIntent.retrieve(payment_intent_id)

            return {
                'success': intent.status == 'succeeded',
                'status': intent.status,
                'transaction_id': intent.id,
                'amount': Decimal(intent.amount) / 100,  # Convert from cents
                'currency': intent.currency.upper(),
                'metadata': intent.metadata,
            }

        except Exception as e:
            logger.error(f"Stripe payment verification failed: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }

    @staticmethod
    def verify_razorpay_payment(payment_id: str, order_id: str, signature: str) -> dict:
        """
        Verify Razorpay payment signature
        
        Args:
            payment_id: Razorpay payment ID
            order_id: Razorpay order ID
            signature: Payment signature
            
        Returns:
            dict with verification status
        """
        try:
            import razorpay
            client = razorpay.Client(
                auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
            )

            # Verify signature
            params_dict = {
                'razorpay_order_id': order_id,
                'razorpay_payment_id': payment_id,
                'razorpay_signature': signature
            }

            client.utility.verify_payment_signature(params_dict)

            # If no exception, signature is valid
            payment = client.payment.fetch(payment_id)

            return {
                'success': True,
                'transaction_id': payment_id,
                'amount': Decimal(payment['amount']) / 100,  # Convert from paise
                'currency': payment['currency'],
                'status': payment['status'],
            }

        except Exception as e:
            logger.error(f"Razorpay payment verification failed: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }

    @staticmethod
    def process_webhook_stripe(payload: dict, sig_header: str) -> dict:
        """
        Process Stripe webhook event
        
        Args:
            payload: Webhook payload
            sig_header: Stripe signature header
            
        Returns:
            dict with processing status
        """
        try:
            import stripe
            stripe.api_key = settings.STRIPE_SECRET_KEY

            event = stripe.Webhook.construct_event(
                payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
            )

            if event['type'] == 'payment_intent.succeeded':
                payment_intent = event['data']['object']
                return {
                    'success': True,
                    'event_type': 'payment_succeeded',
                    'payment_intent_id': payment_intent['id'],
                    'metadata': payment_intent['metadata'],
                }

            elif event['type'] == 'payment_intent.payment_failed':
                payment_intent = event['data']['object']
                return {
                    'success': False,
                    'event_type': 'payment_failed',
                    'payment_intent_id': payment_intent['id'],
                    'error': payment_intent.get('last_payment_error', {}).get('message'),
                }

            return {'success': True, 'event_type': 'unhandled'}

        except Exception as e:
            logger.error(f"Stripe webhook processing failed: {str(e)}")
            return {'success': False, 'error': str(e)}

    @staticmethod
    def create_refund_stripe(payment_intent_id: str, amount: Decimal = None) -> dict:
        """
        Create refund in Stripe
        
        Args:
            payment_intent_id: Stripe Payment Intent ID
            amount: Amount to refund (None for full refund)
            
        Returns:
            dict with refund status
        """
        try:
            import stripe
            stripe.api_key = settings.STRIPE_SECRET_KEY

            refund_params = {'payment_intent': payment_intent_id}
            if amount:
                refund_params['amount'] = int(amount * 100)  # Convert to cents

            refund = stripe.Refund.create(**refund_params)

            return {
                'success': True,
                'refund_id': refund.id,
                'status': refund.status,
                'amount': Decimal(refund.amount) / 100,
            }

        except Exception as e:
            logger.error(f"Stripe refund creation failed: {str(e)}")
            return {'success': False, 'error': str(e)}

    @staticmethod
    def get_payment_method_display(method: str) -> str:
        """Get display name for payment method"""
        methods = {
            'stripe': 'Credit/Debit Card (Stripe)',
            'paypal': 'PayPal',
            'razorpay': 'Razorpay (UPI/Cards/Wallets)',
            'manual': 'Manual Payment',
        }
        return methods.get(method, method)
