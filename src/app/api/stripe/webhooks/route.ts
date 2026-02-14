import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    // This endpoint is no longer in use.
    return NextResponse.json({ received: true, message: "Stripe webhooks are disabled." });
}
