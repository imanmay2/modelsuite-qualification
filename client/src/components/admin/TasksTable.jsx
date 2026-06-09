import { useMemo, useState } from 'react';
import { deleteTask } from '../../api/tasks';
import ConfirmDialog from './ConfirmDialog';

/* ── SVG Action Icons ── */
const IconEdit = () => (
  <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4l5 5M3 16l1-4L14 2a2 2 0 012.83 0l1.17 1.17A2 2 0 0118 5.17L8 15l-4 1z"/>
  </svg>
);

const IconDelete = () => (
  <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h14M8 6V4a1 1 0 011-1h2a1 1 0 011 1v2M17 6l-1 12a2 2 0 01-2 2H6a2 2 0 01-2-2L3 6M9 10v5M11 10v5"/>
  </svg>
);

/* ── Avatar color map ── */
const AVATAR_COLORS = [
  'linear-gradient(135deg,#3B82F6,#2563EB)',
  'linear-gradient(135deg,#8B5CF6,#7C3AED)',
  'linear-gradient(135deg,#10B981,#059669)',
  'linear-gradient(135deg,#F59E0B,#D97706)',
];
const getAvatarGradient = (name = '') => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

/* ── Date formatter ── */
const fmtDate = (raw) => {
  if (!raw) return '—';
  try {
    const d = new Date(raw);
    if (isNaN(d)) return raw;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch { return raw; }
};

/* ── Status badge class ── */
const STATUS_CLASS = {
  Open:      'status-badge-Open',
  Claimed:   'status-badge-Claimed',
  Submitted: 'status-badge-Submitted',
  Approved:  'status-badge-Approved',
  Rejected:  'status-badge-Rejected',
};

const TasksTable = ({ tasks, onEdit, onRefresh }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [taskToDelete, setTaskToDelete] = useState(null);

  const handleSort = (key) => {
    setSortConfig((current) => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const getSortValue = (task, key) => {
    switch (key) {
      case 'title':
        return task.title || '';
      case 'status':
        return task.status || '';
      case 'assignedTo':
        return task.assignedTo?.name || '';
      case 'dueDate':
        return task.dueDate ? new Date(task.dueDate).getTime() || 0 : 0;
      case 'createdAt':
        return task.createdAt ? new Date(task.createdAt).getTime() || 0 : 0;
      default:
        return '';
    }
  };

  const sortedTasks = useMemo(() => {
    if (!sortConfig.key) return tasks;

    return [...tasks].sort((a, b) => {
      const aValue = getSortValue(a, sortConfig.key);
      const bValue = getSortValue(b, sortConfig.key);

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      const result = String(aValue).localeCompare(String(bValue), undefined, {
        sensitivity: 'base',
      });
      return sortConfig.direction === 'asc' ? result : -result;
    });
  }, [tasks, sortConfig]);

  const renderSortHeader = (label, key) => (
    <th className="table-th">
      <button
        type="button"
        onClick={() => handleSort(key)}
        className="flex items-center gap-1 bg-transparent border-none p-0 text-inherit uppercase tracking-[0.07em] cursor-pointer font-semibold font-sans">
        <span>{label}</span>
        {sortConfig.key === key && (
          <span aria-hidden="true">{sortConfig.direction === 'asc' ? '^' : 'v'}</span>
        )}
      </button>
    </th>
  );

  const handleDelete = async () => {
    if (!taskToDelete) return;

    try {
      await deleteTask(taskToDelete._id);
      setTaskToDelete(null);
      onRefresh();
    } catch {
      alert('Failed to delete task');
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="py-20 text-center" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"
          style={{ margin: '0 auto 12px', opacity: 0.3 }} strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="3"/>
          <path d="M9 12h6M9 8h6M9 16h4"/>
        </svg>
        No tasks yet. Create your first task above.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse" style={{ fontSize: '13.5px' }}>
        <thead>
          <tr>
            {renderSortHeader('Title', 'title')}
            {renderSortHeader('Status', 'status')}
            {renderSortHeader('Assigned To', 'assignedTo')}
            {renderSortHeader('Due Date', 'dueDate')}
            {renderSortHeader('Created', 'createdAt')}
            <th className="table-th">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedTasks.map((task, i) => (
            <tr key={task._id}
              className="table-row table-row-animate"
              style={{ animationDelay: `${i * 0.05}s` }}>

              {/* Title + description */}
              <td className="table-td" style={{ maxWidth: '260px' }}>
                <span className="block font-semibold truncate"
                  style={{ color: '#E5E2E1', fontFamily: 'Inter, sans-serif', marginBottom: '2px' }}>
                  {task.title || '—'}
                </span>
                {task.description && (
                  <span className="block truncate" style={{ color: '#4B5563', fontSize: '12px', maxWidth: '240px' }}>
                    {task.description}
                  </span>
                )}
              </td>

              {/* Status badge */}
              <td className="table-td">
                <span className={`inline-block px-2.5 py-[3px] rounded-full text-[11.5px] font-medium ${STATUS_CLASS[task.status] || 'status-badge-Open'}`}
                  style={{ fontFamily: 'Inter, sans-serif' }}>
                  {task.status || '—'}
                </span>
              </td>

              {/* Assigned to */}
              <td className="table-td" style={{ whiteSpace: 'nowrap' }}>
                {task.assignedTo ? (
                  <div className="flex items-center gap-2">
                    <div
                      className="flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                      style={{
                        width: '26px', height: '26px', borderRadius: '50%',
                        background: getAvatarGradient(task.assignedTo.name || ''),
                        fontFamily: 'Inter, sans-serif',
                      }}>
                      {task.assignedTo.name?.[0]?.toUpperCase()}
                    </div>
                    <span style={{ color: '#E5E2E1' }}>{task.assignedTo.name}</span>
                  </div>
                ) : (
                  <span style={{ color: '#4B5563', fontSize: '13px' }}>Unassigned</span>
                )}
              </td>

              {/* Due date */}
              <td className="table-td" style={{ color: '#6B7280', whiteSpace: 'nowrap' }}>
                {fmtDate(task.dueDate)}
              </td>

              {/* Created */}
              <td className="table-td" style={{ color: '#4B5563', whiteSpace: 'nowrap', fontSize: '12.5px' }}>
                {fmtDate(task.createdAt)}
              </td>

              {/* Actions */}
              <td className="table-td">
                <div className="flex gap-1.5">
                  <button
                    onClick={() => onEdit(task)}
                    title="Edit task"
                    className="action-btn action-btn-edit">
                    <IconEdit />
                  </button>
                  <button
                    onClick={() => setTaskToDelete(task)}
                    title="Delete task"
                    className="action-btn action-btn-delete">
                    <IconDelete />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {taskToDelete && (
        <ConfirmDialog
          title="Delete Task?"
          message={`This will permanently delete "${taskToDelete.title || 'this task'}". This action cannot be undone.`}
          confirmLabel="Delete"
          onCancel={() => setTaskToDelete(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
};

export default TasksTable;
