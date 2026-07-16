import { NextRequest, NextResponse } from 'next/server';

import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

// PATCH /api/scholarships/[id]/students/[studentScholarshipId]
// Update grantAmount and/or individualSponsor on a single student-scholarship record
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; studentScholarshipId: string }> }
) {
  try {
    const session = await getSession();

    if (!session || (session.role !== 'ADMIN' && session.role !== 'STAFF')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const { studentScholarshipId } = await params;
    const ssId = parseInt(studentScholarshipId);

    if (isNaN(ssId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid student scholarship ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { grantAmount, individualSponsor } = body;

    // Build update data — only grantAmount and individualSponsor are accepted
    const updateData: Record<string, unknown> = {};
    if (grantAmount !== undefined) {
      updateData.grantAmount = Number(grantAmount);
    }
    if (individualSponsor !== undefined) {
      updateData.individualSponsor = individualSponsor || null;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No valid fields to update. Accepted fields: grantAmount, individualSponsor',
        },
        { status: 400 }
      );
    }

    const updated = await prisma.studentScholarship.update({
      where: { id: ssId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Student scholarship updated successfully',
    });
  } catch (error) {
    console.error('Error updating student scholarship:', error);

    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return NextResponse.json(
        { success: false, error: 'Student scholarship not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update student scholarship' },
      { status: 500 }
    );
  }
}
