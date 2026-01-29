import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/superbase';

// GET subscriptions by sponsor email
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email required' },
        { status: 400 }
      );
    }

    // Get sponsor user
    const { data: sponsor, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (userError || !sponsor) {
      return NextResponse.json(
        { subscriptions: [] },
        { status: 200 }
      );
    }

    // Get subscriptions with student profile info
    const { data: subscriptions, error } = await supabaseAdmin
      .from('subscriptions')
      .select(`
        id,
        amount,
        months,
        current_month,
        status,
        next_charge_date,
        student_profiles (
          name,
          school
        )
      `)
      .eq('sponsor_id', sponsor.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching subscriptions:', error);
      return NextResponse.json(
        { subscriptions: [] },
        { status: 200 }
      );
    }

    // Transform the data to match the expected format
    const formattedSubscriptions = (subscriptions || []).map((sub: any) => ({
      id: sub.id,
      amount: sub.amount,
      months: sub.months,
      current_month: sub.current_month,
      status: sub.status,
      next_charge_date: sub.next_charge_date,
      student: {
        name: sub.student_profiles?.name || 'Unknown',
        school: sub.student_profiles?.school || 'Unknown',
      },
    }));

    return NextResponse.json(
      { subscriptions: formattedSubscriptions },
      { status: 200 }
    );
  } catch (error) {
    console.error('Subscriptions fetch error:', error);
    return NextResponse.json(
      { subscriptions: [] },
      { status: 200 }
    );
  }
}

