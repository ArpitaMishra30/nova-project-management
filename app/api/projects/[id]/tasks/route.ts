import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(
  req: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  const user = await getUser();

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const { id } = await params;

  const body = await req.json();

  const {
    title,
    description,
    status,
    priority,
    dueDate,
    assigneeId,
  } = body;

  if (!title?.trim()) {
    return NextResponse.json(
      { error: 'Task title is required' },
      { status: 400 }
    );
  }

  // Check whether the current user belongs to this project
  const member = await db.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId: id,
        userId: user.id,
      },
    },
  });

  if (!member) {
    return NextResponse.json(
      { error: 'You are not a member of this project' },
      { status: 403 }
    );
  }

  // If an assignee is selected, make sure they belong to this project
  if (assigneeId) {
    const assignee = await db.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: id,
          userId: assigneeId,
        },
      },
    });

    if (!assignee) {
      return NextResponse.json(
        { error: 'Assignee is not a member of this project' },
        { status: 400 }
      );
    }
  }

  const task = await db.task.create({
    data: {
      title: title.trim(),
      description: description || '',
      status: status || 'TODO',
      priority: priority || 'MEDIUM',
      dueDate: dueDate ? new Date(dueDate) : null,
      assigneeId: assigneeId || null,
      projectId: id,
      creatorId: user.id,
    },
    include: {
      assignee: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
  await db.activity.create({
  data: {
    action: 'TASK_CREATED',
    details: `Task "${task.title}" was created`,
    projectId: id,
    userId: user.id,
  },
});

  return NextResponse.json(task, { status: 201 });
}