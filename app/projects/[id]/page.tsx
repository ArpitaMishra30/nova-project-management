import { redirect } from 'next/navigation';
import { getUser } from '@/lib/auth';
import { db } from '@/lib/db';
import ProjectClient from '@/components/ProjectClient';

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const u = await getUser();

  if (!u) {
    redirect('/login');
  }

  const { id } = await params;

  const project = await db.project.findFirst({
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
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  if (!project) {
    redirect('/dashboard');
  }

  const memberIds = project.members.map(
    (member) => member.userId
  );

  const availableUsers = await db.user.findMany({
    where: {
      id: {
        notIn: memberIds,
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
    orderBy: {
      name: 'asc',
    },
  });

  return (
    <ProjectClient
      project={project as any}
      currentUser={u}
      availableUsers={availableUsers}
    />
  );
}