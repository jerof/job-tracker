import { NextRequest, NextResponse } from 'next/server';
import { analyzeCV, CVAnalysisResult } from '@/lib/cv-analyzer';

export interface AnalyzeCVRequest {
  cvText: string;
}

export interface AnalyzeCVResponse extends CVAnalysisResult {
  success: boolean;
  error?: string;
}

/**
 * POST /api/onboarding/analyze-cv
 * Analyze CV text and return questions to fill gaps
 */
export async function POST(request: NextRequest): Promise<NextResponse<AnalyzeCVResponse>> {
  try {
    const body: AnalyzeCVRequest = await request.json();

    // Validate input - cvText can be empty for "no CV" path
    if (typeof body.cvText !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'cvText must be a string',
          questions: [],
          cvQuality: 'none' as const,
        },
        { status: 400 }
      );
    }

    // Analyze the CV
    const result = await analyzeCV(body.cvText);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Error analyzing CV:', error);

    const errorMessage = error instanceof Error ? error.message : 'Failed to analyze CV';

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        questions: [],
        cvQuality: 'none' as const,
      },
      { status: 500 }
    );
  }
}
