import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { createOrder, confirmPayment } from '../utils/paymentsApi';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import DynamicIcon from '../components/DynamicIcon';
import StripeCheckoutForm from '../components/StripeCheckoutForm';
import { useCountries } from '../hooks/useCountries';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

declare global {
  interface Window {
    Razorpay: any;
  }
}

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const { countries, loading: countriesLoading } = useCountries();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentGateway, setPaymentGateway] = useState<'razorpay' | 'stripe'>('razorpay');
  const [showStripeForm, setShowStripeForm] = useState(false);
  const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null);
  const [currentOrderId, setCurrentOrderId] = useState<number | null>(null);

  // Billing details
  const [billingDetails, setBillingDetails] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'IN',
  });
  const [validatingPostal, setValidatingPostal] = useState(false);
  const [postalError, setPostalError] = useState<string | null>(null);
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);

  useEffect(() => {
    // Redirect if cart is empty
    if (!cart || cart.items.length === 0) {
      navigate('/cart');
    }

    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [cart, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBillingDetails({
      ...billingDetails,
      [name]: value,
    });

    // Validate postal code when it changes
    if (name === 'postal_code' && value.length >= 4) {
      validatePostalCode(value, billingDetails.country);
    }
    if (name === 'postal_code' && value.length < 4) {
      setPostalError(null);
    }

    // Re-validate postal code when country changes (if postal code exists)
    if (name === 'country' && billingDetails.postal_code.length >= 4) {
      validatePostalCode(billingDetails.postal_code, value);
    }
  };

  const validatePostalCode = async (postalCode: string, countryCode: string) => {
    if (!postalCode || !countryCode) return;

    setValidatingPostal(true);
    setPostalError(null);

    try {
      // Use India-specific API for Indian PIN codes
      if (countryCode === 'IN' && /^\d{6}$/.test(postalCode)) {
        const response = await fetch(`https://api.postalpincode.in/pincode/${postalCode}`);
        const data = await response.json();

        if (data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
          const postOffice = data[0].PostOffice[0];
          
          // Always update city and state when postal code changes
          setBillingDetails(prev => ({
            ...prev,
            city: postOffice.District,
            state: postOffice.State,
          }));
          
          setPostalError(null);
        } else {
          setPostalError('Invalid PIN code. No post office found.');
        }
      } else {
        // Use Zippopotam API for other countries
        const response = await fetch(`https://api.zippopotam.us/${countryCode.toUpperCase()}/${postalCode}`);
        
        if (response.ok) {
          const data = await response.json();
          
          // Always update city and state when postal code changes
          if (data.places && data.places.length > 0) {
            const place = data.places[0];
            
            setBillingDetails(prev => ({
              ...prev,
              city: place['place name'],
              state: place['state'],
            }));
            
            setPostalError(null);
          }
        } else {
          setPostalError('Invalid postal code for selected country');
        }
      }
    } catch (err) {
      // API might not support this country or postal code format
      // Don't block checkout for API errors, use client-side validation
      const postalPatterns: { [key: string]: { regex: RegExp; example: string } } = {
        US: { regex: /^\d{5}(-\d{4})?$/, example: '12345 or 12345-6789' },
        CA: { regex: /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i, example: 'A1A 1A1' },
        GB: { regex: /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i, example: 'SW1A 1AA' },
        IN: { regex: /^\d{6}$/, example: '110001' },
        AU: { regex: /^\d{4}$/, example: '2000' },
        DE: { regex: /^\d{5}$/, example: '10115' },
        FR: { regex: /^\d{5}$/, example: '75001' },
        IT: { regex: /^\d{5}$/, example: '00118' },
        ES: { regex: /^\d{5}$/, example: '28001' },
        NL: { regex: /^\d{4}\s?[A-Z]{2}$/i, example: '1012 AB' },
        JP: { regex: /^\d{3}-?\d{4}$/, example: '100-0001' },
        CN: { regex: /^\d{6}$/, example: '100000' },
        BR: { regex: /^\d{5}-?\d{3}$/, example: '01310-100' },
        MX: { regex: /^\d{5}$/, example: '01000' },
        ZA: { regex: /^\d{4}$/, example: '0001' },
        SG: { regex: /^\d{6}$/, example: '018956' },
        NZ: { regex: /^\d{4}$/, example: '1010' },
        IE: { regex: /^[A-Z]\d{2}\s?[A-Z0-9]{4}$/i, example: 'D02 AF30' },
        PT: { regex: /^\d{4}-?\d{3}$/, example: '1000-001' },
        PL: { regex: /^\d{2}-?\d{3}$/, example: '00-950' },
      };

      const pattern = postalPatterns[countryCode];
      
      if (pattern) {
        if (pattern.regex.test(postalCode)) {
          setPostalError(null);
        } else {
          setPostalError(`Invalid format. Expected: ${pattern.example}`);
        }
      } else {
        // For countries without specific patterns, just check basic format
        if (/^[A-Z0-9\s-]{3,10}$/i.test(postalCode)) {
          setPostalError(null);
        } else {
          setPostalError('Please enter a valid postal code');
        }
      }
    } finally {
      setValidatingPostal(false);
    }
  };

  const validateForm = (): boolean => {
    if (!billingDetails.first_name || !billingDetails.last_name) {
      setError('Please enter your full name');
      return false;
    }
    if (!billingDetails.email) {
      setError('Please enter your email');
      return false;
    }
    if (!billingDetails.phone) {
      setError('Please enter your phone number');
      return false;
    }
    return true;
  };

  const handlePayment = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      // Create order in backend
      const orderData = await createOrder({
        payment_method: paymentGateway,
        billing_address: {
          first_name: billingDetails.first_name,
          last_name: billingDetails.last_name,
          email: billingDetails.email,
          phone: billingDetails.phone,
          address: billingDetails.address,
          city: billingDetails.city,
          state: billingDetails.state,
          postal_code: billingDetails.postal_code,
          country: billingDetails.country,
        },
      });

      if (paymentGateway === 'razorpay') {
        handleRazorpayPayment(orderData);
      } else {
        handleStripePayment(orderData);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to initialize payment');
      setLoading(false);
    }
  };

  const handleRazorpayPayment = (orderData: any) => {
    try {
      // Initialize Razorpay payment
      const totalAmountInr = parseFloat(orderData.total_amount_inr);
      
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: Math.round(totalAmountInr * 100), // Convert INR to paise
        currency: 'INR', // Always INR for Razorpay to enable UPI/Wallets
        name: 'GenIB',
        description: `Order #${orderData.order_number}`,
        order_id: orderData.razorpay_order_id,
        handler: async function (response: any) {
          setProcessingPayment(true);
          try {
            // Verify payment on backend
            await confirmPayment({
              order_id: orderData.id,
              payment_method: 'razorpay',
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            });

            // Clear cart and redirect to success page
            await clearCart();
            navigate(`/orders/${orderData.id}?success=true`);
          } catch (err: any) {
            setError(err.message || 'Payment verification failed');
            setProcessingPayment(false);
          }
        },
        prefill: {
          name: `${billingDetails.first_name} ${billingDetails.last_name}`,
          email: billingDetails.email,
          contact: billingDetails.phone,
        },
        theme: {
          color: '#2563eb',
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            setError('Payment was cancelled');
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to initialize Razorpay');
      setLoading(false);
    }
  };

  const handleStripePayment = async (orderData: any) => {
    try {
      if (!orderData.stripe_client_secret) {
        throw new Error('Stripe client secret not received');
      }

      // Store order details and show Stripe form
      setStripeClientSecret(orderData.stripe_client_secret);
      setCurrentOrderId(orderData.id);
      setShowStripeForm(true);
      setLoading(false);
      
    } catch (err: any) {
      setError(err.message || 'Failed to initialize Stripe payment');
      setLoading(false);
    }
  };

  const handleStripeSuccess = async () => {
    if (!currentOrderId) return;
    
    setProcessingPayment(true);
    try {
      // Verify payment on backend
      await confirmPayment({
        order_id: currentOrderId,
        payment_method: 'stripe',
        stripe_payment_intent_id: stripeClientSecret?.split('_secret_')[0] || '',
      });

      // Clear cart and redirect to success page
      await clearCart();
      navigate(`/orders/${currentOrderId}?success=true`);
    } catch (err: any) {
      setError(err.message || 'Payment verification failed');
      setProcessingPayment(false);
    }
  };

  const handleStripeError = (errorMessage: string) => {
    setError(errorMessage);
    setProcessingPayment(false);
  };

  if (!cart || cart.items.length === 0) {
    return null;
  }

  const subtotal = cart.items.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);
  const tax = subtotal * 0.18; // 18% GST
  const total = subtotal + tax;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="mt-1 text-sm text-gray-500">Complete your purchase</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Billing Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Billing Information</h2>

              <div className="space-y-4">
                {/* Country - Moved to top */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country *
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setCountryDropdownOpen(!countryDropdownOpen)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-left flex items-center justify-between"
                      disabled={countriesLoading}
                    >
                      <div className="flex items-center gap-2">
                        {billingDetails.country && countries.find(c => c.code === billingDetails.country) ? (
                          <>
                            <img 
                              src={countries.find(c => c.code === billingDetails.country)?.flag} 
                              alt=""
                              className="w-6 h-4 object-cover rounded"
                            />
                            <span>{countries.find(c => c.code === billingDetails.country)?.name}</span>
                          </>
                        ) : (
                          <span className="text-gray-500">Select country...</span>
                        )}
                      </div>
                      <DynamicIcon 
                        name={countryDropdownOpen ? "ArrowUp2" : "ArrowDown2"} 
                        className="w-5 h-5 text-gray-400"
                      />
                    </button>
                    
                    {countryDropdownOpen && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {countriesLoading ? (
                          <div className="px-4 py-2 text-gray-500">Loading countries...</div>
                        ) : (
                          countries.map((country) => (
                            <button
                              key={country.code}
                              type="button"
                              onClick={() => {
                                setBillingDetails({ ...billingDetails, country: country.code });
                                setCountryDropdownOpen(false);
                              }}
                              className={`w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 ${
                                billingDetails.country === country.code ? 'bg-blue-50' : ''
                              }`}
                            >
                              <img 
                                src={country.flag} 
                                alt={country.name}
                                className="w-6 h-4 object-cover rounded"
                              />
                              <span>{country.name}</span>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Name */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      value={billingDetails.first_name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="last_name"
                      value={billingDetails.last_name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={billingDetails.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={billingDetails.phone}
                      onChange={handleInputChange}
                      placeholder="+91 XXXXX XXXXX"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address (Optional)
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={billingDetails.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* City, State, Postal Code */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={billingDetails.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={billingDetails.state}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Postal Code
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="postal_code"
                        value={billingDetails.postal_code}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          postalError ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {validatingPostal && (
                        <div className="absolute right-3 top-2.5">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                        </div>
                      )}
                    </div>
                    {postalError && (
                      <p className="text-xs text-red-600 mt-1">{postalError}</p>
                    )}
                  </div>
                </div>

                {/* Payment Gateway Selection */}
                <div className="pt-4 border-t border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select Payment Method *
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Razorpay Option */}
                    <button
                      type="button"
                      onClick={() => setPaymentGateway('razorpay')}
                      className={`relative p-4 border-2 rounded-lg transition-all ${
                        paymentGateway === 'razorpay'
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-900">Razorpay</span>
                        {paymentGateway === 'razorpay' && (
                          <DynamicIcon name="TickCircle" className="h-5 w-5 text-blue-600" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mb-2">Best for India</p>
                      <div className="flex flex-wrap gap-1 text-xs text-gray-400">
                        <span className="bg-gray-100 px-2 py-0.5 rounded">UPI</span>
                        <span className="bg-gray-100 px-2 py-0.5 rounded">Cards</span>
                        <span className="bg-gray-100 px-2 py-0.5 rounded">Wallets</span>
                        <span className="bg-gray-100 px-2 py-0.5 rounded">QR</span>
                      </div>
                    </button>

                    {/* Stripe Option */}
                    <button
                      type="button"
                      onClick={() => setPaymentGateway('stripe')}
                      className={`relative p-4 border-2 rounded-lg transition-all ${
                        paymentGateway === 'stripe'
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-900">Stripe</span>
                        {paymentGateway === 'stripe' && (
                          <DynamicIcon name="TickCircle" className="h-5 w-5 text-blue-600" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mb-2">International</p>
                      <div className="flex flex-wrap gap-1 text-xs text-gray-400">
                        <span className="bg-gray-100 px-2 py-0.5 rounded">Cards</span>
                        <span className="bg-gray-100 px-2 py-0.5 rounded">Apple Pay</span>
                        <span className="bg-gray-100 px-2 py-0.5 rounded">Google Pay</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-24">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>

              {/* Cart Items */}
              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex gap-3 pb-3 border-b border-gray-100">
                    {item.bundle_details?.cover_image ? (
                      <img
                        src={item.bundle_details.cover_image}
                        alt={item.bundle_details.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-blue-100 rounded flex items-center justify-center">
                        <DynamicIcon name="Package" className="h-8 w-8 text-blue-600" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.bundle_details?.name || item.paper_details?.title || 'Item'}
                      </p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      <p className="text-sm font-semibold text-blue-600">
                        ${parseFloat(item.subtotal).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 mb-6 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium text-gray-900">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax (18% GST)</span>
                  <span className="font-medium text-gray-900">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                  <span>Total (USD)</span>
                  <span className="text-blue-600">${total.toFixed(2)}</span>
                </div>
                {paymentGateway === 'razorpay' && (
                  <>
                    <div className="flex justify-between text-sm text-gray-500 pb-2 border-b border-gray-100">
                      <span>Payment Amount (INR)</span>
                      <span className="font-medium">₹{(total * 83).toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-gray-400 text-center">1 USD = 83 INR (approx.)</p>
                  </>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Payment Button */}
              <button
                onClick={handlePayment}
                disabled={loading || processingPayment}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading || processingPayment ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    {processingPayment ? 'Processing...' : 'Initializing Payment...'}
                  </>
                ) : (
                  <>
                    <DynamicIcon name="Lock" className="h-5 w-5" />
                    {paymentGateway === 'razorpay' 
                      ? `Pay ₹${(total * 83).toFixed(2)}` 
                      : `Pay $${total.toFixed(2)}`
                    }
                  </>
                )}
              </button>

              {/* Payment Methods */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center mb-2">
                  Powered by {paymentGateway === 'razorpay' ? 'Razorpay' : 'Stripe'}
                </p>
                {paymentGateway === 'razorpay' ? (
                  <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                    <span>UPI</span>
                    <span>•</span>
                    <span>Cards</span>
                    <span>•</span>
                    <span>Wallets</span>
                    <span>•</span>
                    <span>NetBanking</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                    <span>Cards</span>
                    <span>•</span>
                    <span>Apple Pay</span>
                    <span>•</span>
                    <span>Google Pay</span>
                  </div>
                )}
              </div>

              {/* Security Badge */}
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                <DynamicIcon name="Lock" className="h-4 w-4" />
                <span>Secure Payment - SSL Encrypted</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stripe Payment Modal */}
        {showStripeForm && stripeClientSecret && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Enter Card Details</h3>
                <button
                  onClick={() => {
                    setShowStripeForm(false);
                    setError('Payment cancelled');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                  disabled={processingPayment}
                >
                  <DynamicIcon name="CloseCircle" className="h-6 w-6" />
                </button>
              </div>

              <Elements stripe={stripePromise}>
                <StripeCheckoutForm
                  clientSecret={stripeClientSecret}
                  amount={total}
                  onSuccess={handleStripeSuccess}
                  onError={handleStripeError}
                  billingDetails={billingDetails}
                />
              </Elements>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Checkout;
