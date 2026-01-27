import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/superbase';
import { openfort } from '../../../lib/openforte';
export async function POST(request: NextRequest) {
  try {
    const { 
      sponsor_email,
      sponsor_wallet,
      student_profile_id, 
      amount,
      months 
    } = await request.json();

    // Validate inputs
    if (!sponsor_email || !sponsor_wallet || !student_profile_id || !amount || !months) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get or create sponsor user
    let { data: sponsor } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', sponsor_email)
      .single();

    if (!sponsor) {
      const { data: newSponsor } = await supabaseAdmin
        .from('users')
        .insert({
          email: sponsor_email,
          wallet_address: sponsor_wallet,
        })
        .select()
        .single();
      sponsor = newSponsor;
    }

    // Get student profile
    const { data: studentProfile } = await supabaseAdmin
      .from('student_profiles')
      .select('*')
      .eq('id', student_profile_id)
      .single();

    if (!studentProfile) {
      return NextResponse.json(
        { error: 'Student profile not found' },
        { status: 404 }
      );
    }

    // Calculate dates
    const now = new Date();
    const validUntil = new Date(now);
    validUntil.setMonth(validUntil.getMonth() + months);
    const nextChargeDate = new Date(now);
    nextChargeDate.setMonth(nextChargeDate.getMonth() + 1);

    // Create session key with Openfort
    const sessionKeyResponse = await openfort.accounts.createSessionKey({
      id: sponsor_wallet, // sponsor's wallet address
      chainId: 84532, // Base Sepolia
      address: sponsor_wallet,
      validUntil: Math.floor(validUntil.getTime() / 1000),
      validAfter: Math.floor(now.getTime() / 1000),
      policy: process.env.OPENFORT_GAS_POLICY_ID!,
    });

    // Save subscription to database
    const { data: subscription, error } = await supabaseAdmin
      .from('subscriptions')
      .insert({
        sponsor_id: sponsor.id,
        student_id: student_profile_id,
        amount: amount,
        months: months,
        current_month: 1,
        session_key_address: sessionKeyResponse.address,
        status: 'active',
        next_charge_date: nextChargeDate.toISOString().split('T')[0],
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ 
      success: true,
      subscription,
      message: 'Subscription created! First payment will be processed now.'
    }, { status: 201 });

  } catch (error: any) {
    console.error('Subscribe error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create subscription' },
      { status: 500 }
    );
  }
}