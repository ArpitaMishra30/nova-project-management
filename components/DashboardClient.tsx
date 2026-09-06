'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function DashboardClient({
  user,
  projects,
  counts,
}: {
  user: any;
  projects: any[];
  counts: any;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const r = useRouter();

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const x = await fetch('/api/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        description,
      }),
    });

    if (x.ok) {
      setOpen(false);
      setName('');
      setDescription('');
      r.refresh();
    } else {
      const data = await x.json().catch(() => ({}));
      setError(data.error || 'Could not create project');
    }
  }

  async function logout() {
    await fetch('/api/auth/logout', {
      method: 'POST',
    });

    r.push('/login');
    r.refresh();
  }

  return (
    <div className="shell">
      {/* Header */}
      <header className="topbar">
        <div className="brand">
          NO<span>VA</span>
        </div>

        <div className="top-actions">
          <span className="muted">{user.name}</span>

          <div className="avatar">
            {user.name[0]}
          </div>

          <button className="btn ghost" onClick={logout}>
            Log out
          </button>
        </div>
      </header>

      <div className="layout">
        {/* Sidebar */}
        <aside className="sidebar">
          <nav className="nav">
            <Link className="active" href="/dashboard">
              Dashboard
            </Link>

            <Link href="/projects">
              Projects
            </Link>

            <Link href="/tasks">
              Tasks
            </Link>
          </nav>

          <div
            className="card"
            style={{
              marginTop: 24,
              padding: 15,
              background: '#fafaff',
            }}
          >
            <div className="label">NOVA WORKSPACE</div>

            <p
              className="muted"
              style={{
                fontSize: 13,
                lineHeight: 1.5,
                margin: '8px 0 0',
              }}
            >
              Plan, collaborate and deliver your work from one place.
            </p>
          </div>
        </aside>

        {/* Main */}
        <main className="main">
          {/* Welcome section */}
          <div className="row">
            <div>
              <h1>
                Good to see you,{' '}
                {user.name.split(' ')[0]} 👋
              </h1>

              <div className="muted">
                Here’s what’s happening across your workspace.
              </div>
            </div>

            <button
              className="btn primary"
              onClick={() => {
                setError('');
                setOpen(true);
              }}
            >
              + New project
            </button>
          </div>

          {/* Statistics */}
          <div className="grid stats">
            <div className="card">
              <div className="label">PROJECTS</div>

              <div className="stat-num">
                {counts.projects}
              </div>

              <div
                className="muted"
                style={{
                  fontSize: 13,
                  marginTop: 5,
                }}
              >
                Active workspace projects
              </div>
            </div>

            <div className="card">
              <div className="label">TOTAL TASKS</div>

              <div className="stat-num">
                {counts.tasks}
              </div>

              <div
                className="muted"
                style={{
                  fontSize: 13,
                  marginTop: 5,
                }}
              >
                Across all projects
              </div>
            </div>

            <div className="card">
              <div className="label">IN PROGRESS</div>

              <div className="stat-num">
                {counts.inProgress}
              </div>

              <div
                className="muted"
                style={{
                  fontSize: 13,
                  marginTop: 5,
                }}
              >
                Tasks currently being worked on
              </div>
            </div>

            <div className="card">
              <div className="label">COMPLETED</div>

              <div className="stat-num">
                {counts.done}
              </div>

              <div
                className="muted"
                style={{
                  fontSize: 13,
                  marginTop: 5,
                }}
              >
                Finished tasks
              </div>
            </div>
          </div>

          {/* Projects heading */}
          <div
            className="row"
            id="projects"
            style={{
              marginTop: 30,
              marginBottom: 14,
            }}
          >
            <div>
              <h2>Your projects</h2>

              <div
                className="muted"
                style={{
                  fontSize: 13,
                  marginTop: 4,
                }}
              >
                Jump back into your active work.
              </div>
            </div>

            <Link
              href="/projects"
              className="btn ghost"
            >
              View all
            </Link>
          </div>

          {/* Project cards */}
          <div className="grid projects">
            {projects.map((p) => (
              <Link
                href={`/projects/${p.id}`}
                key={p.id}
                style={{
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                <div className="card project-card">
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <span
                      className="dot"
                      style={{
                        marginRight: 0,
                        background:
                          p.color === 'violet'
                            ? '#7c3aed'
                            : p.color === 'green'
                            ? '#16a34a'
                            : '#635bff',
                      }}
                    />

                    <b>{p.name}</b>
                  </div>

                  <p
                    className="muted"
                    style={{
                      minHeight: 40,
                      lineHeight: 1.5,
                    }}
                  >
                    {p.description ||
                      'No description yet.'}
                  </p>

                  <div
                    className="row"
                    style={{
                      marginTop: 14,
                    }}
                  >
                    <span className="label">
                      {p._count.tasks}{' '}
                      {p._count.tasks === 1
                        ? 'task'
                        : 'tasks'}
                    </span>

                    <span
                      className="muted"
                      style={{
                        fontSize: 13,
                      }}
                    >
                      Open →
                    </span>
                  </div>
                </div>
              </Link>
            ))}

            {!projects.length && (
              <div className="card empty">
                <div
                  style={{
                    fontSize: 28,
                    marginBottom: 8,
                  }}
                >
                  📁
                </div>

                <b>No projects yet</b>

                <p
                  className="muted"
                  style={{
                    marginBottom: 18,
                  }}
                >
                  Create your first project to get
                  started.
                </p>

                <button
                  className="btn primary"
                  onClick={() => setOpen(true)}
                >
                  + Create project
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Create project modal */}
      {open && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="row">
              <div>
                <h2>Create project</h2>

                <div
                  className="muted"
                  style={{
                    fontSize: 13,
                    marginTop: 4,
                  }}
                >
                  Start a new workspace project.
                </div>
              </div>

              <button
                className="btn ghost"
                onClick={() => setOpen(false)}
              >
                ×
              </button>
            </div>

            <form
              className="form"
              style={{ marginTop: 20 }}
              onSubmit={create}
            >
              <label>
                Name

                <input
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  required
                  placeholder="e.g. Website Redesign"
                />
              </label>

              <label>
                Description

                <textarea
                  value={description}
                  onChange={(e) =>
                    setDescription(e.target.value)
                  }
                  rows={3}
                  placeholder="What are you building?"
                />
              </label>

              {error && (
                <div className="error">
                  {error}
                </div>
              )}

              <button
                className="btn primary"
                type="submit"
              >
                Create project
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}