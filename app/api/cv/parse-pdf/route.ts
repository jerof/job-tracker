import { NextRequest, NextResponse } from 'next/server';
import { PDFParse } from 'pdf-parse';

export interface ParsePDFResponse {
  success: boolean;
  text?: string;
  error?: string;
  pageCount?: number;
}

// Max file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * POST /api/cv/parse-pdf
 * Extract text from uploaded PDF file
 * Accepts multipart form data with a 'file' field
 */
export async function POST(request: NextRequest): Promise<NextResponse<ParsePDFResponse>> {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    // Validate file exists
    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          error: 'No file uploaded. Please provide a PDF file.',
        },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid file type. Please upload a PDF file.',
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: 'File too large. Maximum size is 10MB.',
        },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const data = new Uint8Array(arrayBuffer);

    // Parse PDF using pdf-parse v2 API
    let result;
    let pageCount = 0;
    try {
      const parser = new PDFParse({ data });
      const textResult = await parser.getText();
      result = textResult.text || '';
      pageCount = textResult.pages?.length || 0;
      await parser.destroy();
    } catch (parseError) {
      console.error('PDF parse error:', parseError);
      return NextResponse.json(
        {
          success: false,
          error: 'Could not read PDF. The file may be corrupted or password-protected.',
        },
        { status: 422 }
      );
    }

    // Clean up the text
    const text = result
      // Normalize whitespace
      .replace(/\s+/g, ' ')
      // Fix common PDF extraction issues
      .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space between camelCase
      .replace(/(\w)-\s+(\w)/g, '$1$2') // Fix hyphenated word breaks
      // Restore line breaks for section headers
      .replace(/\s+(EXPERIENCE|EDUCATION|SKILLS|SUMMARY|OBJECTIVE|PROJECTS|CERTIFICATIONS|AWARDS)/gi, '\n\n$1')
      .trim();

    // Check if we got meaningful text
    if (!text || text.length < 20) {
      return NextResponse.json(
        {
          success: false,
          error: 'Could not extract text from PDF. It may be an image-based PDF. Please paste your CV text instead.',
        },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      text,
      pageCount,
    });
  } catch (error) {
    console.error('Error parsing PDF:', error);

    const errorMessage = error instanceof Error ? error.message : 'Failed to parse PDF';

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

// Configure body parser for larger files
export const config = {
  api: {
    bodyParser: false,
  },
};
