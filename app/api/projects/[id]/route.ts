import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth';

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const u = await requireUser();
    const { id } = await params;

    const p = await db.project.findFirst({
      where: {
        id,
        members: {
          some: {
            userId: u.id,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        tasks: {
          include: {
            assignee: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            creator: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!p) {
      return NextResponse.json(
        { error: 'Not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(p);
  } catch {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const u = await requireUser();
    const { id } = await params;

    const body = await req.json();

    const name = body.name?.trim();
    const description = body.description ?? '';
    const color = body.color ?? '#6C63FF';

    if (!name) {
      return NextResponse.json(
        { error: 'Project name is required' },
        { status: 400 }
      );
    }

    const member = await db.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: id,
          userId: u.id,
        },
      },
    });

    if (!member) {
      return NextResponse.json(
        { error: 'You are not a member of this project' },
        { status: 403 }
      );
    }

    if (member.role !== 'ADMIN') {
      return NextResponse.json(
        {
          error:
            'Only project admins can edit the project',
        },
        { status: 403 }
      );
    }

    const project = await db.project.update({
      where: {
        id,
      },
      data: {
        name,
        description,
        color,
      },
    });

    return NextResponse.json(project);
  } catch {
    return NextResponse.json(
      { error: 'Could not update project' },
      { status: 400 }
    );
  }
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const u = await requireUser();
    const { id } = await params;

    const m = await db.projectMember.findFirst({
      where: {
        projectId: id,
        userId: u.id,
        role: 'ADMIN',
      },
    });

    if (!m) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    await db.project.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: 'Request failed' },
      { status: 400 }
    );
  }
}