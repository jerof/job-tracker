import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// POST /api/applications/fix-status - Fix application status
// Body: { company: "Cleo", role: "Lead Product Manager", status: "applied" }
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const { company, role, status } = await request.json();

    if (!company || !status) {
      return NextResponse.json({ error: 'Company and status required' }, { status: 400 });
    }

    // Valid statuses
    const validStatuses = ['saved', 'applied', 'interviewing', 'offer', 'closed'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status', validStatuses }, { status: 400 });
    }

    // Find the application
    let query = supabase
      .from('applications')
      .select('id, company, role, status')
      .ilike('company', `%${company}%`);

    if (role) {
      query = query.ilike('role', `%${role}%`);
    }

    const { data: apps } = await query;

    if (!apps || apps.length === 0) {
      return NextResponse.json({ error: 'No applications found', company, role }, { status: 404 });
    }

    if (apps.length > 1 && !role) {
      return NextResponse.json({
        error: 'Multiple applications found, please specify role',
        applications: apps
      }, { status: 400 });
    }

    const app = apps[0];

    // Update status
    const updateData: Record<string, unknown> = {
      status,
      close_reason: null  // Clear close reason when fixing
    };

    const { error } = await supabase
      .from('applications')
      .update(updateData)
      .eq('id', app.id);

    if (error) {
      return NextResponse.json({ error: 'Update failed', details: error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Updated ${app.company} - ${app.role} from "${app.status}" to "${status}"`,
      application: { ...app, status },
    });
  } catch (error) {
    console.error('Fix status error:', error);
    return NextResponse.json(
      { error: 'Fix failed', details: String(error) },
      { status: 500 }
    );
  }
}
