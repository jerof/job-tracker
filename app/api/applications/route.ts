import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { dbToApplication, applicationToDb } from '@/lib/database.types';

// GET /api/applications - Get all applications for current user
export async function GET() {
  try {
    const supabase = createServerClient();

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured', applications: [], stats: { total: 0, responseRate: 0 } },
        { status: 503 }
      );
    }

    // For now, get all applications (auth will be added later)
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .order('applied_date', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
    }

    const applications = (data || []).map(dbToApplication);

    // Calculate stats
    const total = applications.length;
    const responded = applications.filter(a => a.status !== 'applied').length;
    const responseRate = total > 0 ? Math.round((responded / total) * 100) : 0;

    return NextResponse.json({
      applications,
      stats: { total, responseRate }
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/applications - Create a new application
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();

    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const body = await request.json();

    const { data, error } = await supabase
      .from('applications')
      .insert(applicationToDb(body))
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Application already exists' }, { status: 409 });
      }
      return NextResponse.json({ error: 'Failed to create application' }, { status: 500 });
    }

    return NextResponse.json({ application: dbToApplication(data) }, { status: 201 });
  } catch (error) {
    console.error('Error creating application:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
