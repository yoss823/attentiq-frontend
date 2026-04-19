import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { priceId, successUrl, cancelUrl, intent, amount } = body as {
      priceId?: string;
      successUrl: string;
      cancelUrl: string;
      intent?: string;
      amount?: number;
    };

    if (!successUrl || !cancelUrl) {
      return NextResponse.json(
        { error: 'Missing required fields: successUrl, cancelUrl' },
        { status: 400 }
      );
    }

    // -----------------------------------------------------------------------
    // Recharge flow — flexible one-time payment via price_data
    // -----------------------------------------------------------------------
    if (intent === 'recharge') {
      if (!amount || amount < 100) {
        return NextResponse.json(
          { error: 'Invalid amount: must be at least 100 (cents)' },
          { status: 400 }
        );
      }

      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: 'eur',
              unit_amount: amount,
              product_data: {
                name: 'Recharge de crédit Attentiq',
                description:
                  'Recharge ponctuelle pour maintenir le service opérationnel.',
              },
            },
          },
        ],
        success_url: successUrl,
        cancel_url: cancelUrl,
      });

      return NextResponse.json({ sessionId: session.id });
    }

    // -----------------------------------------------------------------------
    // Standard flow — existing price-ID based checkout
    // -----------------------------------------------------------------------
    if (!priceId) {
      return NextResponse.json(
        { error: 'Missing required field: priceId' },
        { status: 400 }
      );
    }

    // Retrieve the price to determine whether it is one-time or recurring
    const price = await stripe.prices.retrieve(priceId);
    const mode: Stripe.Checkout.SessionCreateParams['mode'] =
      price.type === 'recurring' ? 'subscription' : 'payment';

    const session = await stripe.checkout.sessions.create({
      mode,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('Stripe checkout session error:', error);

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode ?? 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
