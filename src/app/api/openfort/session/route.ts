// This is EXACTLY from Openfort docs:
// https://www.openfort.io/docs/products/embedded-wallet/react

import { NextResponse } from 'next/server';
import { openfort } from '../../../../lib/openforte';

export async function POST() {
  try {
    // Check if required environment variables are set
    if (!process.env.OPENFORT_SECRET_KEY || 
        !process.env.NEXT_PUBLIC_SHIELD_PUBLISHABLE_KEY ||
        !process.env.OPENFORT_SHIELD_SECRET_KEY ||
        !process.env.OPENFORT_SHIELD_ENCRYPTION_SHARE) {
      return NextResponse.json(
        { error: 'Openfort configuration missing' },
        { status: 500 }
      );
    }

    // Create encryption session for wallet recovery
    const session = await openfort.createEncryptionSession(
      process.env.NEXT_PUBLIC_SHIELD_PUBLISHABLE_KEY,
      process.env.OPENFORT_SHIELD_SECRET_KEY,
      process.env.OPENFORT_SHIELD_ENCRYPTION_SHARE
    );
    
    return NextResponse.json({ session }, { status: 200 });
  } catch (error: any) {
    console.error('Encryption session error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create encryption session' },
      { status: 500 }
    );
  }
}