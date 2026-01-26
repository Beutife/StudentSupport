import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/superbase';

// GET profile by user ID
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const profileId = searchParams.get('profileId');

    if (userId) {
      // Get profile by user_id
      const { data: profile, error } = await supabaseAdmin
        .from('student_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error || !profile) {
        return NextResponse.json({ profile: null }, { status: 404 });
      }

      return NextResponse.json({ profile }, { status: 200 });
    } else if (profileId) {
      // Get profile by id
      const { data: profile, error } = await supabaseAdmin
        .from('student_profiles')
        .select('*')
        .eq('id', profileId)
        .single();

      if (error || !profile) {
        return NextResponse.json({ profile: null }, { status: 404 });
      }

      return NextResponse.json({ profile }, { status: 200 });
    }

    return NextResponse.json({ error: 'userId or profileId required' }, { status: 400 });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

// POST create new profile
export async function POST(request: NextRequest) {
  try {
    const { user_id, name, school, story, monthly_need, photo_url } = await request.json();

    // Validate required fields
    if (!user_id || !name || !story || !monthly_need) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if profile already exists
    const { data: existingProfile } = await supabaseAdmin
      .from('student_profiles')
      .select('*')
      .eq('user_id', user_id)
      .single();

    if (existingProfile) {
      return NextResponse.json(
        { error: 'Profile already exists' },
        { status: 409 }
      );
    }

    // Create new profile
    const { data: newProfile, error } = await supabaseAdmin
      .from('student_profiles')
      .insert({
        user_id,
        name,
        school: school || null,
        story,
        monthly_need,
        photo_url: photo_url || null,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ profile: newProfile }, { status: 201 });
  } catch (error) {
    console.error('Profile creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create profile' },
      { status: 500 }
    );
  }
}