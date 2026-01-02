import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { generateTailoredCV, fetchJobDescription } from '@/lib/cv-tailor';
import { generatePDF } from '@/lib/pdf-generator';

interface RouteContext {
  params: Promise<{ id: string }>;
}

interface TailoredCVResponse {
  pdfUrl: string;
  filename: string;
  generatedAt: string;
}

/**
 * GET /api/applications/[id]/tailored-cv
 * Get existing tailored CV metadata for an application
 */
export async function GET(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const { id } = await context.params;

    const supabase = createServerClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    // Fetch application to get tailored CV info
    const { data: application, error } = await supabase
      .from('applications')
      .select('tailored_cv_url, tailored_cv_filename, tailored_cv_generated_at')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Application not found' },
          { status: 404 }
        );
      }
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch application' },
        { status: 500 }
      );
    }

    // Return null if no tailored CV exists
    if (!application.tailored_cv_url) {
      return NextResponse.json({ tailoredCV: null });
    }

    return NextResponse.json({
      tailoredCV: {
        pdfUrl: application.tailored_cv_url,
        filename: application.tailored_cv_filename,
        generatedAt: application.tailored_cv_generated_at,
      },
    });
  } catch (error) {
    console.error('Error fetching tailored CV:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/applications/[id]/tailored-cv
 * Generate a new tailored CV for an application
 */
export async function POST(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const { id } = await context.params;

    // Parse request body
    let feedback: string | undefined;
    try {
      const body = await request.json();
      feedback = body?.feedback;
    } catch {
      // Empty body is OK
    }

    const supabase = createServerClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    // Step 1: Fetch the application
    const { data: application, error: appError } = await supabase
      .from('applications')
      .select('id, company, role, job_url')
      .eq('id', id)
      .single();

    if (appError) {
      if (appError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Application not found' },
          { status: 404 }
        );
      }
      console.error('Database error:', appError);
      return NextResponse.json(
        { error: 'Failed to fetch application' },
        { status: 500 }
      );
    }

    if (!application.job_url) {
      return NextResponse.json(
        { error: 'Application has no job URL. Add a job URL to generate a tailored CV.' },
        { status: 400 }
      );
    }

    // Step 2: Fetch master CV
    // Using fixed user ID for now (single user mode)
    const { data: cvData, error: cvError } = await supabase
      .from('cvs')
      .select('raw_text')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (cvError) {
      if (cvError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'No master CV found. Please add your CV first.' },
          { status: 400 }
        );
      }
      console.error('Database error:', cvError);
      return NextResponse.json(
        { error: 'Failed to fetch master CV' },
        { status: 500 }
      );
    }

    if (!cvData.raw_text || cvData.raw_text.trim().length < 50) {
      return NextResponse.json(
        { error: 'Master CV is too short. Please add more content to your CV.' },
        { status: 400 }
      );
    }

    // Step 3: Fetch job description from URL
    const jobDescription = await fetchJobDescription(application.job_url);
    if (!jobDescription) {
      return NextResponse.json(
        { error: 'Could not fetch job description from URL. Please check the URL is accessible.' },
        { status: 400 }
      );
    }

    // Step 4: Generate tailored CV HTML using Claude
    let tailoredResult;
    try {
      tailoredResult = await generateTailoredCV({
        masterCV: cvData.raw_text,
        jobDescription,
        company: application.company || 'Unknown Company',
        role: application.role || 'Unknown Role',
        feedback,
      });
    } catch (error) {
      console.error('CV generation error:', error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Failed to generate tailored CV' },
        { status: 500 }
      );
    }

    // Step 5: Generate PDF from HTML
    let pdfBuffer: Buffer;
    try {
      pdfBuffer = await generatePDF(tailoredResult.html);
    } catch (error) {
      console.error('PDF generation error:', error);
      return NextResponse.json(
        { error: 'Failed to generate PDF. Please try again.' },
        { status: 500 }
      );
    }

    // Step 6: Upload PDF to Supabase Storage
    const sanitizedCompany = (application.company || 'company')
      .replace(/[^a-zA-Z0-9]/g, '_')
      .slice(0, 30);
    const timestamp = Date.now();
    const filename = `CV_${sanitizedCompany}_${timestamp}.pdf`;
    const storagePath = `tailored-cvs/${id}/${filename}`;

    const { error: uploadError } = await supabase.storage
      .from('tailored-cvs')
      .upload(storagePath, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      // Check if bucket doesn't exist
      if (uploadError.message?.includes('Bucket not found') || uploadError.message?.includes('bucket')) {
        return NextResponse.json(
          { error: 'Storage bucket not configured. Please create "tailored-cvs" bucket in Supabase Storage.' },
          { status: 503 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to upload PDF. Please try again.' },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('tailored-cvs')
      .getPublicUrl(storagePath);

    const pdfUrl = urlData.publicUrl;
    const generatedAt = new Date().toISOString();

    // Step 7: Update application with CV reference
    const { error: updateError } = await supabase
      .from('applications')
      .update({
        tailored_cv_url: pdfUrl,
        tailored_cv_filename: filename,
        tailored_cv_generated_at: generatedAt,
        updated_at: generatedAt,
      })
      .eq('id', id);

    if (updateError) {
      console.error('Application update error:', updateError);
      // Don't fail the request - PDF was generated successfully
    }

    // Return success response
    const response: TailoredCVResponse = {
      pdfUrl,
      filename,
      generatedAt,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Tailored CV generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
