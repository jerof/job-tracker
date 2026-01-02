import { NextRequest, NextResponse } from 'next/server';
import { enhanceCV } from '@/lib/cv-enhancer';

export interface EnhanceCVRequest {
  cvText: string;
  answers: Record<string, string>;
}

export interface EnhanceCVResponse {
  success: boolean;
  masterCV?: string;
  error?: string;
}

/**
 * POST /api/onboarding/enhance-cv
 * Merge CV text and answers into an enhanced master CV
 */
export async function POST(request: NextRequest): Promise<NextResponse<EnhanceCVResponse>> {
  try {
    const body: EnhanceCVRequest = await request.json();

    // Validate input
    if (typeof body.cvText !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'cvText must be a string',
        },
        { status: 400 }
      );
    }

    if (!body.answers || typeof body.answers !== 'object') {
      return NextResponse.json(
        {
          success: false,
          error: 'answers must be an object',
        },
        { status: 400 }
      );
    }

    // Check if we have enough input to generate a CV
    const hasCV = body.cvText.trim().length >= 50;
    const hasAnswers = Object.values(body.answers).some(
      (v) => typeof v === 'string' && v.trim().length > 0
    );

    if (!hasCV && !hasAnswers) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please provide either a CV or answer some questions',
        },
        { status: 400 }
      );
    }

    // Enhance the CV
    const result = await enhanceCV({
      cvText: body.cvText,
      answers: body.answers,
    });

    return NextResponse.json({
      success: true,
      masterCV: result.masterCV,
    });
  } catch (error) {
    console.error('Error enhancing CV:', error);

    const errorMessage = error instanceof Error ? error.message : 'Failed to enhance CV';

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
