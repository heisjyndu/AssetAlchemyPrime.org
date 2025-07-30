// Stripe integration service
export class StripeService {
  private stripePublishableKey: string;

  constructor() {
    this.stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';
  }

  async loadStripe() {
    if (!window.Stripe) {
      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/';
      script.async = true;
      document.head.appendChild(script);
      
      return new Promise((resolve) => {
        script.onload = () => {
          resolve(window.Stripe(this.stripePublishableKey));
        };
      });
    }
    return window.Stripe(this.stripePublishableKey);
  }

  async createPaymentIntent(amount: number, currency: string = 'usd') {
    const response = await fetch('/api/payments/create-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
      body: JSON.stringify({ amount: amount * 100, currency }), // Convert to cents
    });

    if (!response.ok) {
      throw new Error('Failed to create payment intent');
    }

    return response.json();
  }

  async confirmPayment(stripe: any, clientSecret: string, paymentMethod: any) {
    return stripe.confirmCardPayment(clientSecret, {
      payment_method: paymentMethod,
    });
  }
}

export const stripeService = new StripeService();

// Extend Window interface for TypeScript
declare global {
  interface Window {
    Stripe: any;
  }
}