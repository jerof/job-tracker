import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * DELETE /api/cvs/[id]
 * Delete a tailored CV (removes from storage and clears application reference)
 */
export async function DELETE(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const { id } = await context.params;

    // Only allow deleting tailored CVs (id format: tailored-{applicationId})
    if (!id.startsWith('tailored-')) {
      return NextResponse.json(
        { error: 'Cannot delete master CV from this endpoint' },
        { status: 400 }
      );
    }

    const applicationId = id.replace('tailored-', '');

    const supabase = createServerClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    // Get the application to find the storage path
    const { data: application, error: fetchError } = await supabase
      .from('applications')
      .select('tailored_cv_url, tailored_cv_filename')
      .eq('id', applicationId)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Application not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching application:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch application' },
        { status: 500 }
      );
    }

    if (!application.tailored_cv_url) {
      return NextResponse.json(
        { error: 'No tailored CV exists for this application' },
        { status: 404 }
      );
    }

    // Extract storage path from URL
    // URL format: .../storage/v1/object/public/tailored-cvs/tailored-cvs/{id}/{filename}
    const storagePath = `tailored-cvs/${applicationId}/${application.tailored_cv_filename}`;

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('tailored-cvs')
      .remove([storagePath]);

    if (storageError) {
      console.error('Error deleting from storage:', storageError);
      // Continue even if storage delete fails - still clear the reference
    }

    // Clear the CV reference from the application
    const { error: updateError } = await supabase
      .from('applications')
      .update({
        tailored_cv_url: null,
        tailored_cv_filename: null,
        tailored_cv_generated_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', applicationId);

    if (updateError) {
      console.error('Error updating application:', updateError);
      return NextResponse.json(
        { error: 'Failed to delete CV reference' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting CV:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
