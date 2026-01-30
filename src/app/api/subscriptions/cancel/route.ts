import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { subscriptionId } = await request.json();
    
    // Update subscription status to cancelled
    const { error } = await supabaseAdmin
      .from('subscriptions')
      .update({ status: 'cancelled' })
      .eq('id', subscriptionId);
    
    if (error) throw error;
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}