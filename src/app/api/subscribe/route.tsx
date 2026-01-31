import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabase';
import { openfort } from '../../../lib/openforte';
import { TransactionIntent, TransactionIntentResponse } from '@openfort/openfort-node';
export async function POST(request: NextRequest) {
  try {
    const { 
        sponsor_email,
        sponsor_player_id,
        student_profile_id, 
        student_wallet,
        amount,
        months  
    } = await request.json();

    // Validate inputs
    if (!sponsor_email || !sponsor_player_id || !student_profile_id || !student_wallet || !amount || !months) {
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
          wallet_address: null,
        })
        .select()
        .single();

      if (!newSponsor) {
        return NextResponse.json(
          { error: 'Failed to create sponsor' },
          { status: 500 }
        );
      }
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

    // Create transaction intent with Openfort 
    // Note: This might fail if the sponsor doesn't have an Openfort account yet
    // We'll handle this gracefully and still create the subscription
    let transactionIntentId: string | null = null;
    
    // Only try to create transaction intent if Openfort is properly configured
    if (process.env.OPENFORT_SECRET_KEY && process.env.OPENFORT_GAS_POLICY_ID) {
      try {
        const transactionIntent = await openfort.transactionIntents.create({
          player: sponsor_player_id,
          chainId: 84532, // Base Sepolia
          optimistic: true,
          policy: process.env.OPENFORT_GAS_POLICY_ID,
          interactions: [
            {
              contract: '0x036CbD53842c5426634e7929541eC2318f3dCF7e', // USDC on Base Sepolia
              functionName: 'transfer',
              functionArgs: [student_wallet, amount * 1000000], // USDC has 6 decimals
            },
          ],
        });
        transactionIntentId = transactionIntent.id;
      } catch (txError: any) {
        console.warn('Transaction intent creation failed:', txError);
        // Continue without transaction intent - subscription can still be created
        // The transaction can be created later when processing payments
      }
    } else {
      console.warn('Openfort not fully configured - skipping transaction intent creation');
    }


    // Calculate dates
    const now = new Date();
    const validUntil = new Date(now);
    validUntil.setMonth(validUntil.getMonth() + months);
    const nextChargeDate = new Date(now);
    nextChargeDate.setMonth(nextChargeDate.getMonth() + 1);

    // Save subscription to database
    const { data: subscription, error } = await supabaseAdmin
      .from('subscriptions')
      .insert({
        sponsor_id: sponsor.id,
        student_id: student_profile_id,
        amount: amount,
        months: months,
        current_month: 1,
        session_key_address: transactionIntentId, // Can be null if transaction intent creation failed
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
    
    // Format error message properly
    let errorMessage = 'Failed to create subscription';
    if (error?.message) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error?.error) {
      errorMessage = typeof error.error === 'string' ? error.error : error.error.message || errorMessage;
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}