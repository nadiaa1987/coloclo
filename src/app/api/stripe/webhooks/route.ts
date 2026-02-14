import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/firebase';
import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';

async function getFirebaseUserByStripeCustomerId(customerId: string) {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('stripeCustomerId', '==', customerId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        return null;
    }

    return querySnapshot.docs[0];
}

export async function POST(req: NextRequest) {
    const body = await req.text();
    const signature = headers().get('Stripe-Signature') as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (error: any) {
        return NextResponse.json({ error: `Webhook Error: ${error.message}` }, { status: 400 });
    }

    const session = event.data.object as Stripe.Checkout.Session;

    switch (event.type) {
        case 'checkout.session.completed': {
            const subscription = await stripe.subscriptions.retrieve(
                session.subscription as string
            );
            
            const firebaseUID = session.metadata?.firebaseUID;
            if (!firebaseUID) {
                 console.error('No firebaseUID in checkout session metadata');
                 break;
            }

            const userRef = doc(db, 'users', firebaseUID);
            
            await updateDoc(userRef, {
                plan: subscription.items.data[0].price.id === process.env.STRIPE_MONTHLY_PRICE_ID ? 'monthly' : 'yearly',
                stripeSubscriptionId: subscription.id,
                stripePriceId: subscription.items.data[0].price.id,
                stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
            });
            break;
        }
        case 'customer.subscription.updated': {
            const subscription = event.data.object as Stripe.Subscription;
            const customerId = subscription.customer as string;
            const userDoc = await getFirebaseUserByStripeCustomerId(customerId);

            if (userDoc) {
                 await updateDoc(userDoc.ref, {
                    plan: subscription.items.data[0].price.id === process.env.STRIPE_MONTHLY_PRICE_ID ? 'monthly' : 'yearly',
                    stripePriceId: subscription.items.data[0].price.id,
                    stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
                });
            }
            break;
        }
        case 'customer.subscription.deleted': {
            const subscription = event.data.object as Stripe.Subscription;
            const customerId = subscription.customer as string;
            const userDoc = await getFirebaseUserByStripeCustomerId(customerId);

            if (userDoc) {
                await updateDoc(userDoc.ref, {
                    plan: 'none',
                    stripeSubscriptionId: null,
                    stripePriceId: null,
                    stripeCurrentPeriodEnd: null,
                });
            }
            break;
        }
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
}
