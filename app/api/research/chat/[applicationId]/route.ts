import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

/**
 * GET /api/research/chat/[applicationId]
 * Load chat history for an application
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  try {
    const { applicationId } = await params;

    const supabase = createServerClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    const { data, error } = await supabase
      .from('research_chats')
      .select('messages')
      .eq('application_id', applicationId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Failed to fetch chat history:', error);
      return NextResponse.json(
        { error: 'Failed to load chat history' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      messages: data?.messages || [],
    });

  } catch (error) {
    console.error('Chat history error:', error);
    return NextResponse.json(
      { error: 'Failed to load chat history' },
      { status: 500 }
    );
  }
}
