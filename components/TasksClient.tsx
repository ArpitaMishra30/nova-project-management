'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function TasksClient({
  tasks,
  currentUserId,
}: {
  tasks: any[];
  currentUserId: string;
}) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [priority, setPriority] = useState('ALL');
  const [assignee, setAssignee] = useState('ALL');
  const [myTasks, setMyTasks] = useState(false);

  const filteredTasks = tasks.filter((task) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      task.title.toLowerCase().includes(searchText) ||
      (task.description || '')
        .toLowerCase()
        .includes(searchText) ||
      task.project.name
        .toLowerCase()
        .includes(searchText) ||
      (task.assignee?.name || '')
        .toLowerCase()
        .includes(searchText);

    const matchesStatus =
      status === 'ALL' || task.status === status;

    const matchesPriority =
      priority === 'ALL' ||
      task.priority === priority;

    const matchesAssignee =
      assignee === 'ALL' ||
      (assignee === 'UNASSIGNED'
        ? !task.assignee
        : task.assignee?.id === assignee);

    const matchesMyTasks =
      !myTasks ||
      task.assignee?.id === currentUserId;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesPriority &&
      matchesAssignee &&
      matchesMyTasks
    );
  });

  const todo = tasks.filter(
    (task) => task.status === 'TODO'
  ).length;

  const inProgress = tasks.filter(
    (task) => task.status === 'IN_PROGRESS'
  ).length;

  const done = tasks.filter(
    (task) => task.status === 'DONE'
  ).length;

  const assignees = Array.from(
    new Map(
      tasks
        .filter((task) => task.assignee)
        .map((task) => [
          task.assignee.id,
          task.assignee,
        ])
    ).values()
  );

  return (
    <>
      {/* Statistics */}
      <div
        className="grid"
        style={{
          gridTemplateColumns:
            'repeat(3, 1fr)',
          marginTop: 24,
        }}
      >
        <div className="card">
          <div className="label">TO DO</div>

          <div className="stat-num">
            {todo}
          </div>

          <div
            className="muted"
            style={{
              fontSize: 13,
              marginTop: 5,
            }}
          >
            Tasks waiting to be started
          </div>
        </div>

        <div className="card">
          <div className="label">
            IN PROGRESS
          </div>

          <div className="stat-num">
            {inProgress}
          </div>

          <div
            className="muted"
            style={{
              fontSize: 13,
              marginTop: 5,
            }}
          >
            Tasks currently active
          </div>
        </div>

        <div className="card">
          <div className="label">
            COMPLETED
          </div>

          <div className="stat-num">
            {done}
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

      {/* Filters */}
      <div
        className="card"
        style={{ marginTop: 24 }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              '1fr 180px 180px 180px',
            gap: 12,
          }}
        >
          {/* Search */}
          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search tasks, projects or people..."
            style={{
              width: '100%',
              border: '1px solid #dfe1eb',
              borderRadius: 10,
              padding: '11px 12px',
              outline: 'none',
            }}
          />

          {/* Status */}
          <select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value)
            }
            style={{
              border: '1px solid #dfe1eb',
              borderRadius: 10,
              padding: '11px 12px',
              background: '#fff',
            }}
          >
            <option value="ALL">
              All statuses
            </option>

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

          {/* Priority */}
          <select
            value={priority}
            onChange={(e) =>
              setPriority(e.target.value)
            }
            style={{
              border: '1px solid #dfe1eb',
              borderRadius: 10,
              padding: '11px 12px',
              background: '#fff',
            }}
          >
            <option value="ALL">
              All priorities
            </option>

            <option value="HIGH">
              High
            </option>

            <option value="MEDIUM">
              Medium
            </option>

            <option value="LOW">
              Low
            </option>
          </select>

          {/* Assignee */}
          <select
            value={assignee}
            onChange={(e) =>
              setAssignee(e.target.value)
            }
            style={{
              border: '1px solid #dfe1eb',
              borderRadius: 10,
              padding: '11px 12px',
              background: '#fff',
            }}
          >
            <option value="ALL">
              All assignees
            </option>

            <option value="UNASSIGNED">
              Unassigned
            </option>

            {assignees.map((user: any) => (
              <option
                key={user.id}
                value={user.id}
              >
                {user.name}
              </option>
            ))}
          </select>
        </div>

        {/* My Tasks */}
        <div
          style={{
            marginTop: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <button
            type="button"
            className={`btn ${
              myTasks ? '' : 'ghost'
            }`}
            onClick={() =>
              setMyTasks(!myTasks)
            }
          >
            {myTasks
              ? '✓ My Tasks'
              : 'My Tasks'}
          </button>

          {myTasks && (
            <span
              className="muted"
              style={{ fontSize: 13 }}
            >
              Showing tasks assigned to you
            </span>
          )}
        </div>
      </div>

      {/* Task list heading */}
      <div
        className="row"
        style={{
          marginTop: 30,
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
            Showing {filteredTasks.length} of{' '}
            {tasks.length} tasks
          </div>
        </div>
      </div>

      {/* Task list */}
      <div className="tasks">
        {filteredTasks.map((task) => (
          <Link
            key={task.id}
            href={`/projects/${task.project.id}`}
            style={{
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <div className="task">
              <div style={{ flex: 1 }}>
                <b>{task.title}</b>

                <div
                  className="muted"
                  style={{
                    fontSize: 13,
                    marginTop: 5,
                  }}
                >
                  {task.description ||
                    'No description'}
                </div>

                <div
                  className="muted"
                  style={{
                    fontSize: 13,
                    marginTop: 7,
                  }}
                >
                  📁 {task.project.name}
                  {' · '}
                  {task.assignee
                    ? `👤 ${task.assignee.name}`
                    : '👤 Unassigned'}
                </div>

                {/* Due date */}
                {task.dueDate && (
                  <div
                    className="muted"
                    style={{
                      fontSize: 13,
                      marginTop: 5,
                    }}
                  >
                    📅 Due:{' '}
                    {new Date(task.dueDate).toLocaleDateString(
  'en-IN',
  {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }
)}
                    {new Date(task.dueDate) <
                      new Date() &&
                      task.status !== 'DONE' && (
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
              </div>

              {/* Status */}
              <span
                className={`pill ${
                  task.status === 'DONE'
                    ? 'done'
                    : task.status ===
                      'IN_PROGRESS'
                    ? 'progress'
                    : 'todo'
                }`}
              >
                {task.status === 'DONE'
                  ? 'Done'
                  : task.status ===
                    'IN_PROGRESS'
                  ? 'In progress'
                  : 'To do'}
              </span>

              {/* Priority */}
              <span
                className={`label ${
                  task.priority === 'HIGH'
                    ? 'high'
                    : task.priority === 'MEDIUM'
                    ? 'medium'
                    : 'low'
                }`}
              >
                {task.priority}
              </span>
            </div>
          </Link>
        ))}

        {!filteredTasks.length && (
          <div className="card empty">
            <div
              style={{
                fontSize: 28,
                marginBottom: 8,
              }}
            >
              🔍
            </div>

            <b>No matching tasks</b>

            <p className="muted">
              Try changing your search or filters.
            </p>
          </div>
        )}
      </div>

      {/* Responsive filter styling */}
      <style jsx>{`
        @media (max-width: 900px) {
          .card > div {
            grid-template-columns:
              1fr 1fr !important;
          }
        }

        @media (max-width: 700px) {
          .card > div {
            grid-template-columns:
              1fr !important;
          }
        }
      `}</style>
    </>
  );
}