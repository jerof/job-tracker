import { createServerClient } from '@/lib/supabase';
import { generateTailoredCV, fetchJobDescription } from '@/lib/cv-tailor';
import { generatePDF } from '@/lib/pdf-generator';

/**
 * Trigger CV generation for an application in the background.
 * This function does NOT await - it fires and forgets.
 *
 * Call this when:
 * - A new application is created with a job_url
 * - A job_url is added to an existing application
 */
export function triggerCVGeneration(applicationId: string): void {
  // Fire and forget - don't await
  generateCVForApplication(applicationId).catch((error) => {
    console.error(`[CV Auto-Gen] Failed for ${applicationId}:`, error);
  });
}

async function generateCVForApplication(applicationId: string): Promise<void> {
  console.log(`[CV Auto-Gen] Starting for application ${applicationId}`);

  const supabase = createServerClient();
  if (!supabase) {
    console.error('[CV Auto-Gen] Database not configured');
    return;
  }

  // Check if CV already exists
  const { data: app, error: fetchError } = await supabase
    .from('applications')
    .select('id, company, role, job_url, tailored_cv_url')
    .eq('id', applicationId)
    .single();

  if (fetchError || !app) {
    console.error('[CV Auto-Gen] Application not found:', fetchError);
    return;
  }

  // Skip if already has CV or no job URL
  if (app.tailored_cv_url) {
    console.log('[CV Auto-Gen] CV already exists, skipping');
    return;
  }

  if (!app.job_url) {
    console.log('[CV Auto-Gen] No job URL, skipping');
    return;
  }

  // Get master CV
  const { data: cvData, error: cvError } = await supabase
    .from('cvs')
    .select('raw_text')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (cvError || !cvData?.raw_text || cvData.raw_text.trim().length < 50) {
    console.log('[CV Auto-Gen] No master CV found, skipping');
    return;
  }

  // Fetch job description
  const jobDescription = await fetchJobDescription(app.job_url);
  if (!jobDescription) {
    console.log('[CV Auto-Gen] Could not fetch job description, skipping');
    return;
  }

  // Generate tailored CV
  let tailoredResult;
  try {
    tailoredResult = await generateTailoredCV({
      masterCV: cvData.raw_text,
      jobDescription,
      company: app.company || 'Unknown Company',
      role: app.role || 'Unknown Role',
    });
  } catch (error) {
    console.error('[CV Auto-Gen] CV generation failed:', error);
    return;
  }

  // Generate PDF
  let pdfBuffer: Buffer;
  try {
    pdfBuffer = await generatePDF(tailoredResult.html);
  } catch (error) {
    console.error('[CV Auto-Gen] PDF generation failed:', error);
    return;
  }

  // Upload to storage
  const sanitizedCompany = (app.company || 'company')
    .replace(/[^a-zA-Z0-9]/g, '_')
    .slice(0, 30);
  const timestamp = Date.now();
  const filename = `CV_${sanitizedCompany}_${timestamp}.pdf`;
  const storagePath = `tailored-cvs/${applicationId}/${filename}`;

  const { error: uploadError } = await supabase.storage
    .from('tailored-cvs')
    .upload(storagePath, pdfBuffer, {
      contentType: 'application/pdf',
      upsert: true,
    });

  if (uploadError) {
    console.error('[CV Auto-Gen] Upload failed:', uploadError);
    return;
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('tailored-cvs')
    .getPublicUrl(storagePath);

  // Update application
  const { error: updateError } = await supabase
    .from('applications')
    .update({
      tailored_cv_url: urlData.publicUrl,
      tailored_cv_filename: filename,
      tailored_cv_generated_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', applicationId);

  if (updateError) {
    console.error('[CV Auto-Gen] Update failed:', updateError);
    return;
  }

  console.log(`[CV Auto-Gen] Success for ${applicationId}`);
}
