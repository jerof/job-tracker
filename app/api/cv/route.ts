import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { dbToCV, cvToDb, CreateCVRequest } from '@/lib/cv.types';

// GET /api/cv - Get user's CV
export async function GET() {
  try {
    const supabase = createServerClient();

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured', cv: null },
        { status: 503 }
      );
    }

    // For now, get the first CV (single user mode)
    // TODO: Add proper user authentication
    const { data, error } = await supabase
      .from('cvs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      // No CV found is not an error - return null
      if (error.code === 'PGRST116') {
        return NextResponse.json({ cv: null });
      }
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch CV' }, { status: 500 });
    }

    return NextResponse.json({ cv: dbToCV(data) });
  } catch (error) {
    console.error('Error fetching CV:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/cv - Create new CV
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();

    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const body: CreateCVRequest = await request.json();

    if (!body.rawText || body.rawText.trim().length === 0) {
      return NextResponse.json({ error: 'CV text is required' }, { status: 400 });
    }

    // Create new CV
    const cvData = cvToDb({
      userId: 'default-user', // TODO: Get from auth
      rawText: body.rawText.trim(),
      fileName: body.fileName || null,
      pdfStoragePath: null,
      fileSizeBytes: null,
    });

    const { data, error } = await supabase
      .from('cvs')
      .insert(cvData)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to create CV' }, { status: 500 });
    }

    return NextResponse.json({ cv: dbToCV(data) }, { status: 201 });
  } catch (error) {
    console.error('Error creating CV:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
