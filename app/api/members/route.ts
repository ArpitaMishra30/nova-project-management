import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  const user = await getUser();

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const members = await db.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
    orderBy: {
      name: 'asc',
    },
  });

  return NextResponse.json(members);
}

export async function POST(req: Request) {
  const user = await getUser();

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const body = await req.json();

  const { projectId, userId, role } = body;

  if (!projectId || !userId) {
    return NextResponse.json(
      { error: 'Project and member are required' },
      { status: 400 }
    );
  }

  // Check whether current user is an ADMIN
  const currentMember = await db.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId: user.id,
      },
    },
  });

  if (!currentMember) {
    return NextResponse.json(
      { error: 'You are not a member of this project' },
      { status: 403 }
    );
  }

  if (currentMember.role !== 'ADMIN') {
    return NextResponse.json(
      { error: 'Only project admins can add members' },
      { status: 403 }
    );
  }

  const member = await db.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!member) {
    return NextResponse.json(
      { error: 'User not found' },
      { status: 404 }
    );
  }

  const existing = await db.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId,
      },
    },
  });

  if (existing) {
    return NextResponse.json(
      { error: 'User is already a project member' },
      { status: 409 }
    );
  }

  const newMember = await db.projectMember.create({
    data: {
      projectId,
      userId,
      role: role === 'ADMIN' ? 'ADMIN' : 'MEMBER',
    },
    include: {
      user: {
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
    action: 'MEMBER_ADDED',
    details: `${newMember.user.name} was added to the project`,
    projectId,
    userId: user.id,
  },
});

  return NextResponse.json(newMember, {
    status: 201,
  });
}
export async function DELETE(req: Request) {
  const user = await getUser();

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const body = await req.json();

  const { projectId, userId } = body;

  if (!projectId || !userId) {
    return NextResponse.json(
      { error: 'Project and member are required' },
      { status: 400 }
    );
  }

  // Check current user's project membership
  const currentMember = await db.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId: user.id,
      },
    },
  });

  if (!currentMember) {
    return NextResponse.json(
      { error: 'You are not a member of this project' },
      { status: 403 }
    );
  }

  // Only project ADMIN can remove members
  if (currentMember.role !== 'ADMIN') {
    return NextResponse.json(
      { error: 'Only project admins can remove members' },
      { status: 403 }
    );
  }

  // Don't allow the admin to remove themselves
  if (userId === user.id) {
    return NextResponse.json(
      { error: 'You cannot remove yourself from the project' },
      { status: 400 }
    );
  }

  const member = await db.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId,
      },
    },
  });

  if (!member) {
    return NextResponse.json(
      { error: 'Member not found in this project' },
      { status: 404 }
    );
  }
  const removedUser = await db.user.findUnique({
  where: {
    id: userId,
  },
  select: {
    name: true,
  },
});

await db.activity.create({
  data: {
    action: 'MEMBER_REMOVED',
    details: `${removedUser?.name || 'A member'} was removed from the project`,
    projectId,
    userId: user.id,
  },
});
  await db.projectMember.delete({
    where: {
      projectId_userId: {
        projectId,
        userId,
      },
    },
  });

  return NextResponse.json({
    success: true,
  });
}
export async function PATCH(req: Request) {
  const user = await getUser();

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const body = await req.json();

  const { projectId, userId, role } = body;

  if (!projectId || !userId || !role) {
    return NextResponse.json(
      { error: 'Project, member and role are required' },
      { status: 400 }
    );
  }

  if (role !== 'ADMIN' && role !== 'MEMBER') {
    return NextResponse.json(
      { error: 'Invalid role' },
      { status: 400 }
    );
  }

  // Check current user's project membership
  const currentMember = await db.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId: user.id,
      },
    },
  });

  if (!currentMember) {
    return NextResponse.json(
      { error: 'You are not a member of this project' },
      { status: 403 }
    );
  }

  // Only project ADMIN can change roles
  if (currentMember.role !== 'ADMIN') {
    return NextResponse.json(
      { error: 'Only project admins can change roles' },
      { status: 403 }
    );
  }

  // Don't allow admin to change their own role
  if (userId === user.id) {
    return NextResponse.json(
      { error: 'You cannot change your own role' },
      { status: 400 }
    );
  }

  const member = await db.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId,
      },
    },
  });

  if (!member) {
    return NextResponse.json(
      { error: 'Member not found in this project' },
      { status: 404 }
    );
  }

  const updatedMember = await db.projectMember.update({
    where: {
      projectId_userId: {
        projectId,
        userId,
      },
    },
    data: {
      role,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return NextResponse.json(updatedMember);
}