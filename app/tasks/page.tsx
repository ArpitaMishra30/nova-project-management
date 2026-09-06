import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getUser } from '@/lib/auth';
import { db } from '@/lib/db';
import TasksClient from '@/components/TasksClient';

export default async function TasksPage() {
  const user = await getUser();

  if (!user) {
    redirect('/login');
  }

  const tasks = await db.task.findMany({
    where: {
      project: {
        members: {
          some: {
            userId: user.id,
          },
        },
      },
    },
    include: {
      project: {
        select: {
          id: true,
          name: true,
        },
      },
      assignee: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand">
          NO<span>VA</span>
        </div>

        <div className="top-actions">
          <Link
            href="/dashboard"
            className="btn ghost"
          >
            ← Dashboard
          </Link>

          <div className="avatar">
            {user.name[0]}
          </div>
        </div>
      </header>

      <main className="main">
        <div className="row">
          <div>
            <h1>All Tasks</h1>

            <div className="muted">
              Track and manage tasks across your
              projects.
            </div>
          </div>
        </div>

        <TasksClient
          tasks={tasks}
          currentUserId={user.id}
        />
      </main>
    </div>
  );
}