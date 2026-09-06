import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth';

const schema = z.object({
  title: z.string().min(2).optional(),
  description: z.string().max(1000).nullable().optional(),
  status: z
    .enum(['TODO', 'IN_PROGRESS', 'DONE'])
    .optional(),
  priority: z
    .enum(['LOW', 'MEDIUM', 'HIGH'])
    .optional(),
  assigneeId: z.string().nullable().optional(),
  dueDate: z.string().nullable().optional(),
});

export async function PATCH(
  req: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const u = await requireUser();
    const { id } = await params;

    const old = await db.task.findUnique({
      where: { id },
    });

    if (!old) {
      return NextResponse.json(
        { error: 'Not found' },
        { status: 404 }
      );
    }

    // Check whether current user belongs to the project
    const member = await db.projectMember.findFirst({
      where: {
        projectId: old.projectId,
        userId: u.id,
      },
    });

    if (!member) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const body = schema.parse(await req.json());

    // Security check:
    // Assignee must also be a member of this project.
    if (body.assigneeId) {
      const assignee = await db.projectMember.findUnique({
        where: {
          projectId_userId: {
            projectId: old.projectId,
            userId: body.assigneeId,
          },
        },
      });

      if (!assignee) {
        return NextResponse.json(
          {
            error:
              'Assignee is not a member of this project',
          },
          { status: 400 }
        );
      }
    }

    const task = await db.task.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        status: body.status,
        priority: body.priority,
        assigneeId: body.assigneeId,
        dueDate:
          body.dueDate === undefined
            ? undefined
            : body.dueDate
            ? new Date(body.dueDate)
            : null,
      },
    });

    await db.activity.create({
    data: {
    action: 'TASK_UPDATED',
    details: `Task "${task.title}" was updated`,
    projectId: old.projectId,
    userId: u.id,
  },
});

    return NextResponse.json(task);
  } catch {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}

export async function DELETE(
  _: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const u = await requireUser();
    const { id } = await params;

    const task = await db.task.findUnique({
      where: { id },
    });

    if (!task) {
      return NextResponse.json(
        { error: 'Not found' },
        { status: 404 }
      );
    }

    // Check whether current user belongs to the project
    const member = await db.projectMember.findFirst({
      where: {
        projectId: task.projectId,
        userId: u.id,
      },
    });

    if (!member) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }
    await db.activity.create({
  data: {
    action: 'TASK_DELETED',
    details: `Task "${task.title}" was deleted`,
    projectId: task.projectId,
    userId: u.id,
  },
});
    await db.task.delete({
      where: { id },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: 'Request failed' },
      { status: 400 }
    );
  }
}