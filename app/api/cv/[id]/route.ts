import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { dbToCV, UpdateCVRequest } from '@/lib/cv.types';

// PUT /api/cv/[id] - Update CV
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServerClient();

    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const { id } = await params;
    const body: UpdateCVRequest = await request.json();

    // Build update object
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (body.rawText !== undefined) {
      if (body.rawText.trim().length === 0) {
        return NextResponse.json({ error: 'CV text cannot be empty' }, { status: 400 });
      }
      updateData.raw_text = body.rawText.trim();
    }

    if (body.fileName !== undefined) {
      updateData.file_name = body.fileName;
    }

    const { data, error } = await supabase
      .from('cvs')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'CV not found' }, { status: 404 });
      }
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to update CV' }, { status: 500 });
    }

    return NextResponse.json({ cv: dbToCV(data) });
  } catch (error) {
    console.error('Error updating CV:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/cv/[id] - Delete CV
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServerClient();

    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const { id } = await params;

    const { error } = await supabase
      .from('cvs')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to delete CV' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting CV:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
