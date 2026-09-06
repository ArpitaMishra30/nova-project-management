'use client';


import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const statusLabel = (s: string) =>
  s === 'IN_PROGRESS'
    ? 'In progress'
    : s === 'DONE'
    ? 'Done'
    : 'To do';

export default function ProjectClient({
  project,
  currentUser,
  availableUsers,
}: {
  project: any;
  currentUser: any;
  availableUsers: any[];
}) {
  const [activities, setActivities] = useState<any[]>([]);
  const r = useRouter();
  useEffect(() => {
  loadActivities();
}, [project.id]);
  async function loadActivities() {
  const response = await fetch(
    `/api/activity?projectId=${project.id}`
  );

  if (!response.ok) return;

  const data = await response.json();
  setActivities(data);
}

  // New task modal
  const [open, setOpen] = useState(false);

  // Project edit
  const [projectEditOpen, setProjectEditOpen] =
    useState(false);
  const [projectName, setProjectName] = useState(
    project.name
  );
  const [projectDescription, setProjectDescription] =
    useState(project.description || '');
  const [projectColor, setProjectColor] = useState(
    project.color || '#6C63FF'
  );
  const [projectError, setProjectError] =
    useState('');
  const [projectLoading, setProjectLoading] =
    useState(false);

  // Add member modal
  const [memberOpen, setMemberOpen] =
    useState(false);
  const [memberId, setMemberId] = useState('');
  const [memberRole, setMemberRole] =
    useState('MEMBER');
  const [memberError, setMemberError] =
    useState('');
  const [memberLoading, setMemberLoading] =
    useState(false);

  // New task
  const [title, setTitle] = useState('');
  const [description, setDescription] =
    useState('');
  const [priority, setPriority] =
    useState('MEDIUM');
  const [assigneeId, setAssigneeId] =
    useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');

  // Edit task
  const [editOpen, setEditOpen] =
    useState(false);
  const [editTask, setEditTask] =
    useState<any>(null);
  const [editTitle, setEditTitle] =
    useState('');
  const [editDescription, setEditDescription] =
    useState('');
  const [editPriority, setEditPriority] =
    useState('MEDIUM');
  const [editAssigneeId, setEditAssigneeId] =
    useState('');
  const [editDueDate, setEditDueDate] =
    useState('');
  const [editError, setEditError] =
    useState('');
  const [editLoading, setEditLoading] =
    useState(false);

  // Current project member
  const currentMember =
    project.members.find(
      (member: any) =>
        member.user.id === currentUser.id
    );

  const isProjectAdmin =
    currentMember?.role === 'ADMIN';

  // Create task
  async function create(
    e: React.FormEvent
  ) {
    e.preventDefault();
    setError('');

    const x = await fetch(
      `/api/projects/${project.id}/tasks`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          priority,
          assigneeId:
            assigneeId || null,
          dueDate:
            dueDate || null,
        }),
      }
    );

    const d = await x
      .json()
      .catch(() => ({}));

    if (!x.ok) {
      setError(
        d.error ||
          'Could not create task'
      );
      return;
    }

    setOpen(false);
    setTitle('');
    setDescription('');
    setPriority('MEDIUM');
    setAssigneeId('');
    setDueDate('');

    r.refresh();
  }

  // Edit task
  async function editTaskSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setEditError('');
    setEditLoading(true);

    const x = await fetch(
      `/api/tasks/${editTask.id}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type':
            'application/json',
        },
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
          priority: editPriority,
          assigneeId:
            editAssigneeId || null,
          dueDate:
            editDueDate || null,
        }),
      }
    );

    const data = await x
      .json()
      .catch(() => ({}));

    setEditLoading(false);

    if (!x.ok) {
      setEditError(
        data.error ||
          'Could not update task'
      );
      return;
    }

    setEditOpen(false);
    setEditTask(null);

    r.refresh();
  }

  // Update project
  async function updateProject(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setProjectError('');
    setProjectLoading(true);

    const x = await fetch(
      `/api/projects/${project.id}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type':
            'application/json',
        },
        body: JSON.stringify({
          name: projectName,
          description:
            projectDescription,
          color: projectColor,
        }),
      }
    );

    const data = await x
      .json()
      .catch(() => ({}));

    setProjectLoading(false);

    if (!x.ok) {
      setProjectError(
        data.error ||
          'Could not update project'
      );
      return;
    }

    setProjectEditOpen(false);

    r.refresh();
  }

  // Delete project
  async function deleteProject() {
    const confirmed = confirm(
      `Delete "${project.name}"? This will permanently delete the project and its tasks.`
    );

    if (!confirmed) return;

    const x = await fetch(
      `/api/projects/${project.id}`,
      {
        method: 'DELETE',
      }
    );

    const data = await x
      .json()
      .catch(() => ({}));

    if (!x.ok) {
      alert(
        data.error ||
          'Could not delete project'
      );
      return;
    }

    r.push('/dashboard');
  }

  // Add member
  async function addMember(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (!memberId) {
      setMemberError(
        'Please select a member'
      );
      return;
    }

    setMemberError('');
    setMemberLoading(true);

    const x = await fetch(
      '/api/members',
      {
        method: 'POST',
        headers: {
          'Content-Type':
            'application/json',
        },
        body: JSON.stringify({
          projectId: project.id,
          userId: memberId,
          role: memberRole,
        }),
      }
    );

    const data = await x
      .json()
      .catch(() => ({}));

    setMemberLoading(false);

    if (!x.ok) {
      setMemberError(
        data.error ||
          'Could not add member'
      );
      return;
    }

    setMemberOpen(false);
    setMemberId('');
    setMemberRole('MEMBER');

    r.refresh();
  }

  // Change task status
  async function status(
    id: string,
    newStatus: string
  ) {
    await fetch(
      `/api/tasks/${id}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type':
            'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      }
    );

    r.refresh();
  }

  // Delete task
  async function del(id: string) {
    if (!confirm('Delete this task?'))
      return;

    await fetch(
      `/api/tasks/${id}`,
      {
        method: 'DELETE',
      }
    );

    r.refresh();
  }

  // Open edit task modal
  function openEditTask(task: any) {
    setEditTask(task);
    setEditTitle(task.title);
    setEditDescription(
      task.description || ''
    );
    setEditPriority(
      task.priority || 'MEDIUM'
    );
    setEditAssigneeId(
      task.assigneeId || ''
    );

    setEditDueDate(
      task.dueDate
        ? new Date(task.dueDate)
            .toISOString()
            .split('T')[0]
        : ''
    );

    setEditError('');
    setEditOpen(true);
  }

  const done = project.tasks.filter(
    (t: any) =>
      t.status === 'DONE'
  ).length;

  const pct = project.tasks.length
    ? Math.round(
        (done /
          project.tasks.length) *
          100
      )
    : 0;

  return (
    <div className="shell">
      {/* Header */}
      <header className="topbar">
        <div className="brand">
          NO<span>VA</span>
        </div>

        <div className="top-actions">
          <Link
            className="btn ghost"
            href="/dashboard"
          >
            ← Dashboard
          </Link>

          <div className="avatar">
            {currentUser.name[0]}
          </div>
        </div>
      </header>

      <main className="main">
        {/* Project header */}
        <div className="row">
          <div>
            <h1>{project.name}</h1>

            <div className="muted">
              {project.description ||
                'No description yet.'}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              gap: 8,
              flexWrap: 'wrap',
            }}
          >
            {isProjectAdmin && (
              <>
                <button
                  className="btn ghost"
                  onClick={() => {
                    setProjectName(
                      project.name
                    );
                    setProjectDescription(
                      project.description ||
                        ''
                    );
                    setProjectColor(
                      project.color ||
                        '#6C63FF'
                    );
                    setProjectError('');
                    setProjectEditOpen(
                      true
                    );
                  }}
                >
                  Edit project
                </button>

                <button
                  className="btn ghost danger"
                  onClick={
                    deleteProject
                  }
                >
                  Delete
                </button>
              </>
            )}

            <button
              className="btn primary"
              onClick={() => {
                setError('');
                setOpen(true);
              }}
            >
              + Add task
            </button>
          </div>
        </div>

        {/* Project progress */}
        <div
          className="card"
          style={{
            marginTop: 22,
          }}
        >
          <div className="row">
            <div>
              <div className="label">
                PROJECT PROGRESS
              </div>

              <h2
                style={{
                  marginTop: 5,
                }}
              >
                {pct}% complete
              </h2>
            </div>

            <div className="muted">
              {done} of{' '}
              {project.tasks.length}{' '}
              tasks
            </div>
          </div>

          <div
            className="bar"
            style={{
              marginTop: 14,
            }}
          >
            <div
              style={{
                width: `${pct}%`,
              }}
            />
          </div>
        </div>

        {/* Team section */}
        <div
          className="row"
          style={{
            marginTop: 30,
            marginBottom: 12,
          }}
        >
          <div>
            <h2>Team</h2>

            <div
              className="muted"
              style={{
                fontSize: 13,
                marginTop: 4,
              }}
            >
              People working on this
              project.
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems:
                'center',
              gap: 12,
            }}
          >
            <span className="muted">
              {project.members.length}{' '}
              {project.members.length ===
              1
                ? 'member'
                : 'members'}
            </span>

            {isProjectAdmin && (
              <button
                className="btn primary"
                onClick={() => {
                  setMemberError('');
                  setMemberOpen(
                    true
                  );
                }}
              >
                + Add member
              </button>
            )}
          </div>
        </div>

        {/* Team members */}
        <div className="grid projects">
          {project.members.map(
            (member: any) => (
              <div
                className="card"
                key={member.user.id}
                style={{
                  display: 'flex',
                  alignItems:
                    'center',
                  gap: 14,
                }}
              >
                <div
                  className="avatar"
                  style={{
                    flexShrink: 0,
                  }}
                >
                  {member.user.name[0]}
                </div>

                <div
                  style={{
                    minWidth: 0,
                    flex: 1,
                  }}
                >
                  <b>
                    {member.user.name}
                  </b>

                  <div
                    className="muted"
                    style={{
                      fontSize: 13,
                      marginTop: 4,
                    }}
                  >
                    {
                      member.user
                        .email
                    }
                  </div>

                  <div
                    style={{
                      marginTop: 7,
                    }}
                  >
                    <span className="pill">
                      {member.role}
                    </span>
                  </div>
                </div>

                {isProjectAdmin &&
                  member.user.id !==
                    currentUser.id && (
                    <div
                      style={{
                        display:
                          'flex',
                        alignItems:
                          'center',
                        gap: 8,
                      }}
                    >
                      <button
                        className="btn ghost"
                        onClick={async () => {
                          const newRole =
                            member.role ===
                            'ADMIN'
                              ? 'MEMBER'
                              : 'ADMIN';

                          const confirmed =
                            confirm(
                              `Change ${member.user.name}'s role to ${newRole}?`
                            );

                          if (
                            !confirmed
                          )
                            return;

                          const x =
                            await fetch(
                              '/api/members',
                              {
                                method:
                                  'PATCH',
                                headers:
                                  {
                                    'Content-Type':
                                      'application/json',
                                  },
                                body: JSON.stringify(
                                  {
                                    projectId:
                                      project.id,
                                    userId:
                                      member
                                        .user
                                        .id,
                                    role: newRole,
                                  }
                                ),
                              }
                            );

                          const data =
                            await x
                              .json()
                              .catch(
                                () => ({})
                              );

                          if (!x.ok) {
                            alert(
                              data.error ||
                                'Could not change member role'
                            );
                            return;
                          }

                          r.refresh();
                        }}
                      >
                        Make{' '}
                        {member.role ===
                        'ADMIN'
                          ? 'Member'
                          : 'Admin'}
                      </button>

                      <button
                        className="btn ghost danger"
                        onClick={async () => {
                          if (
                            !confirm(
                              `Remove ${member.user.name} from this project?`
                            )
                          ) {
                            return;
                          }

                          const x =
                            await fetch(
                              '/api/members',
                              {
                                method:
                                  'DELETE',
                                headers:
                                  {
                                    'Content-Type':
                                      'application/json',
                                  },
                                body: JSON.stringify(
                                  {
                                    projectId:
                                      project.id,
                                    userId:
                                      member
                                        .user
                                        .id,
                                  }
                                ),
                              }
                            );

                          const data =
                            await x
                              .json()
                              .catch(
                                () => ({})
                              );

                          if (!x.ok) {
                            alert(
                              data.error ||
                                'Could not remove member'
                            );
                            return;
                          }

                          r.refresh();
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  )}
              </div>
            )
          )}
        </div>

        {/* Tasks heading */}
        <div
          className="row"
          style={{
            marginTop: 32,
            marginBottom: 12,
          }}
        >
          <div>
            <h2>Tasks</h2>

            <div
              className="muted"
              style={{
                fontSize: 13,
                marginTop: 4,
              }}
            >
              Create, assign and track
              project tasks.
            </div>
          </div>

          <span className="muted">
            {project.tasks.length}{' '}
            total
          </span>
        </div>

        {/* Tasks */}
        <div className="tasks">
          {project.tasks.map(
            (t: any) => (
              <div
                className="task"
                key={t.id}
              >
                <div>
                  <b>{t.title}</b>

                  <div
                    className="muted"
                    style={{
                      fontSize: 13,
                      marginTop: 4,
                    }}
                  >
                    {t.description ||
                      'No description'}

                    {t.assignee &&
                      ` · Assigned to ${t.assignee.name}`}
                  </div>
                </div>

              {/* Due Date */}
{t.dueDate && (
  <div
    className="muted"
    style={{
      fontSize: 13,
      marginTop: 5,
    }}
  >
    📅 Due:{' '}
    {new Date(t.dueDate).toLocaleDateString()}

    {new Date(t.dueDate) < new Date() &&
      t.status !== 'DONE' && (
        <span
          style={{
            marginLeft: 8,
            color: '#dc2626',
            fontWeight: 700,
          }}
        >
          Overdue
        </span>
      )}
  </div>
)}

<span
  className={`pill ${
    t.status === 'DONE'
      ? 'done'
      : t.status === 'IN_PROGRESS'
      ? 'progress'
      : 'todo'
  }`}
>
  {statusLabel(t.status)}
</span>

<select
  value={t.status}
  onChange={(e) =>
    status(
      t.id,
      e.target.value
    )
  }
>
  <option value="TODO">
    To do
  </option>

  <option value="IN_PROGRESS">
    In progress
  </option>

  <option value="DONE">
    Done
  </option>
</select>

<button
  className="btn ghost"
  onClick={() =>
    openEditTask(t)
  }
>
  Edit
</button>

<button
  className="btn ghost danger"
  onClick={() =>
    del(t.id)
  }
>
  Delete
</button>
</div>
))}

{/* Activity History */}
<div
  className="row"
  style={{
    marginTop: 32,
    marginBottom: 12,
  }}
>
  <div>
    <h2>Activity History</h2>

    <div
      className="muted"
      style={{
        fontSize: 13,
        marginTop: 4,
      }}
    >
      Recent activity in this project.
    </div>
  </div>

  <span className="muted">
    {activities.length} activities
  </span>
</div>

<div className="tasks">
  {activities.map((activity: any) => (
    <div
      className="task"
      key={activity.id}
    >
      <div
        className="avatar"
        style={{
          width: 36,
          height: 36,
          minWidth: 36,
          fontSize: 14,
        }}
      >
        {activity.user.name[0]}
      </div>

      <div style={{ flex: 1 }}>
        <b>{activity.user.name}</b>

        <div
          className="muted"
          style={{
            fontSize: 13,
            marginTop: 4,
          }}
        >
          {activity.details}
        </div>

        <div
          className="muted"
          style={{
            fontSize: 12,
            marginTop: 5,
          }}
        >
          {new Date(
            activity.createdAt
          ).toLocaleString()}
        </div>
      </div>
    </div>
  ))}

  {!activities.length && (
    <div className="card empty">
      No activity yet.
    </div>
  )}
</div>

{!project.tasks.length && (
  <div className="card empty">
    No tasks yet. Add one to start
    tracking progress.
  </div>
)}
</div>
</main>

{/* New task modal */}
{open && (
  <div className="modal-backdrop">
    <div className="modal">
      <div className="row">
        <h2>New task</h2>

        <button
          className="btn ghost"
          onClick={() =>
            setOpen(false)
          }
        >
          ×
        </button>
      </div>

      <form
        className="form"
        style={{
          marginTop: 18,
        }}
        onSubmit={create}
      >
        <label>
          Title

          <input
            value={title}
            onChange={(e) =>
              setTitle(e.target.value)
            }
            required
            placeholder="e.g. Build authentication"
          />
        </label>

        <label>
          Description

          <textarea
            rows={3}
            value={description}
            onChange={(e) =>
              setDescription(
                e.target.value
              )
            }
          />
        </label>

        <label>
          Priority

          <select
            value={priority}
            onChange={(e) =>
              setPriority(
                e.target.value
              )
            }
          >
            <option value="LOW">
              Low
            </option>

            <option value="MEDIUM">
              Medium
            </option>

            <option value="HIGH">
              High
            </option>
          </select>
        </label>

        <label>
          Due date

          <input
            type="date"
            value={dueDate}
            onChange={(e) =>
              setDueDate(e.target.value)
            }
          />
        </label>

        <label>
          Assign to

          <select
            value={assigneeId}
            onChange={(e) =>
              setAssigneeId(
                e.target.value
              )
            }
          >
            <option value="">
              Unassigned
            </option>

            {project.members.map(
              (member: any) => (
                <option
                  key={member.user.id}
                  value={member.user.id}
                >
                  {member.user.name}
                </option>
              )
            )}
          </select>
        </label>

        <div
          className="muted"
          style={{
            fontSize: 12,
            marginTop: -8,
          }}
        >
          Assign this task to any
          member of the project.
        </div>

        {error && (
          <div className="error">
            {error}
          </div>
        )}

        <button
          className="btn primary"
          type="submit"
        >
          Create task
        </button>
      </form>
    </div>
  </div>
)}

{/* Edit task modal */}
{editOpen && editTask && (
  <div className="modal-backdrop">
    <div className="modal">
      <div className="row">
        <div>
          <h2>Edit task</h2>

          <div
            className="muted"
            style={{
              fontSize: 13,
              marginTop: 4,
            }}
          >
            Update task details and
            assignment.
          </div>
        </div>

        <button
          className="btn ghost"
          onClick={() => {
            setEditOpen(false);
            setEditTask(null);
          }}
        >
          ×
        </button>
      </div>

      <form
        className="form"
        style={{
          marginTop: 20,
        }}
        onSubmit={editTaskSubmit}
      >
        <label>
          Title

          <input
            value={editTitle}
            onChange={(e) =>
              setEditTitle(
                e.target.value
              )
            }
            required
            placeholder="Task title"
          />
        </label>

        <label>
          Description

          <textarea
            rows={3}
            value={editDescription}
            onChange={(e) =>
              setEditDescription(
                e.target.value
              )
            }
          />
        </label>

        <label>
          Priority

          <select
            value={editPriority}
            onChange={(e) =>
              setEditPriority(
                e.target.value
              )
            }
          >
            <option value="LOW">
              Low
            </option>

            <option value="MEDIUM">
              Medium
            </option>

            <option value="HIGH">
              High
            </option>
          </select>
        </label>

        <label>
          Due date

          <input
            type="date"
            value={editDueDate}
            onChange={(e) =>
              setEditDueDate(
                e.target.value
              )
            }
          />
        </label>

        <label>
          Assign to

          <select
            value={editAssigneeId}
            onChange={(e) =>
              setEditAssigneeId(
                e.target.value
              )
            }
          >
            <option value="">
              Unassigned
            </option>

            {project.members.map(
              (member: any) => (
                <option
                  key={member.user.id}
                  value={member.user.id}
                >
                  {member.user.name}
                </option>
              )
            )}
          </select>
        </label>

        {editError && (
          <div className="error">
            {editError}
          </div>
        )}

        <button
          className="btn primary"
          type="submit"
          disabled={editLoading}
        >
          {editLoading
            ? 'Saving...'
            : 'Save changes'}
        </button>
      </form>
    </div>
  </div>
)}

{/* Edit project modal */}
{projectEditOpen && (
  <div className="modal-backdrop">
    <div className="modal">
      <div className="row">
        <div>
          <h2>Edit project</h2>

          <div
            className="muted"
            style={{
              fontSize: 13,
              marginTop: 4,
            }}
          >
            Update your project details.
          </div>
        </div>

        <button
          className="btn ghost"
          onClick={() =>
            setProjectEditOpen(false)
          }
        >
          ×
        </button>
      </div>

      <form
        className="form"
        style={{
          marginTop: 20,
        }}
        onSubmit={updateProject}
      >
        <label>
          Project name

          <input
            value={projectName}
            onChange={(e) =>
              setProjectName(
                e.target.value
              )
            }
            required
            placeholder="Project name"
          />
        </label>

        <label>
          Description

          <textarea
            rows={4}
            value={projectDescription}
            onChange={(e) =>
              setProjectDescription(
                e.target.value
              )
            }
            placeholder="What is this project about?"
          />
        </label>

        <label>
          Project color

          <input
            type="color"
            value={projectColor}
            onChange={(e) =>
              setProjectColor(
                e.target.value
              )
            }
            style={{
              width: 70,
              height: 42,
              padding: 4,
              cursor: 'pointer',
            }}
          />
        </label>

        {projectError && (
          <div className="error">
            {projectError}
          </div>
        )}

        <button
          className="btn primary"
          type="submit"
          disabled={projectLoading}
        >
          {projectLoading
            ? 'Saving...'
            : 'Save changes'}
        </button>
      </form>
    </div>
  </div>
)}

{/* Add member modal */}
{memberOpen && (
  <div className="modal-backdrop">
    <div className="modal">
      <div className="row">
        <div>
          <h2>Add team member</h2>

          <div
            className="muted"
            style={{
              fontSize: 13,
              marginTop: 4,
            }}
          >
            Add a person to this
            project.
          </div>
        </div>

        <button
          className="btn ghost"
          onClick={() =>
            setMemberOpen(false)
          }
        >
          ×
        </button>
      </div>

      <form
        className="form"
        style={{
          marginTop: 20,
        }}
        onSubmit={addMember}
      >
        <label>
          Member

          <select
            value={memberId}
            onChange={(e) =>
              setMemberId(
                e.target.value
              )
            }
          >
            <option value="">
              Select member
            </option>

            {availableUsers.map(
              (user: any) => (
                <option
                  key={user.id}
                  value={user.id}
                >
                  {user.name} — {user.email}
                </option>
              )
            )}
          </select>
        </label>

        <label>
          Role

          <select
            value={memberRole}
            onChange={(e) =>
              setMemberRole(
                e.target.value
              )
            }
          >
            <option value="MEMBER">
              Member
            </option>

            <option value="ADMIN">
              Admin
            </option>
          </select>
        </label>

        {availableUsers.length ===
          0 && (
          <div className="muted">
            All registered users are
            already members of this
            project.
          </div>
        )}

        {memberError && (
          <div className="error">
            {memberError}
          </div>
        )}

        <button
          className="btn primary"
          type="submit"
          disabled={
            memberLoading ||
            availableUsers.length ===
              0
          }
        >
          {memberLoading
            ? 'Adding...'
            : 'Add member'}
        </button>
      </form>
    </div>
  </div>
)}
</div>
);
}