import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getUser } from '@/lib/auth';
import { db } from '@/lib/db';

export default async function ProjectsPage() {
  const user = await getUser();

  if (!user) redirect('/login');

  const projects = await db.project.findMany({
    where: {
      members: {
        some: {
          userId: user.id,
        },
      },
    },
    include: {
      _count: {
        select: {
          tasks: true,
        },
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });

  return (
    <main className="main">
      <div className="row">
        <div>
          <h1>Your Projects</h1>
          <div className="muted">
            Manage and track all your projects.
          </div>
        </div>

        <Link href="/dashboard" className="btn ghost">
          ← Dashboard
        </Link>
      </div>

      <div className="grid projects" style={{ marginTop: 24 }}>
        {projects.map((project) => (
          <Link
            key={project.id}
            href={`/projects/${project.id}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div className="card project-card">
              <div>
                <b>{project.name}</b>
              </div>

              <p className="muted">
                {project.description || 'No description yet.'}
              </p>

              <div className="label">
                {project._count.tasks} tasks
              </div>
            </div>
          </Link>
        ))}

        {!projects.length && (
          <div className="card empty">
            No projects yet. Create your first project.
          </div>
        )}
      </div>
    </main>
  );
}