import { NextRequest, NextResponse } from 'next/server';
import { saveProfile, getProfile, getAllProfiles } from '@/lib/db';
import type { StartupProfile } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const profile: StartupProfile = await req.json();

    if (!profile.name || !profile.id) {
      return NextResponse.json(
        { success: false, error: 'Profile ID and Name are required.' },
        { status: 400 }
      );
    }

    saveProfile(profile);

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error: any) {
    console.error('Save profile error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save profile' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (id) {
      const profile = getProfile(id);
      return NextResponse.json({ success: true, profile });
    }

    const profiles = getAllProfiles();
    return NextResponse.json({ success: true, profiles });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch profiles' },
      { status: 500 }
    );
  }
}
