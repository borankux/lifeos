import React, { useState, useEffect } from 'react';
import type { Task } from '../../common/types';
import { ConfirmDialog } from './ConfirmDialog';
import MDEditor from '@uiw/react-md-editor';

interface TaskDetailPanelProps {
  task: Task;
  onClose: () => void;
  onUpdate: (id: number, updates: Partial<Task>) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export function TaskDetailPanel({ task, onClose, onUpdate, onDelete }: TaskDetailPanelProps) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [priority, setPriority] = useState(task.priority || 'Not Urgent & Not Important');
  const [dueDate, setDueDate] = useState(task.dueDate || '');
  const [tags, setTags] = useState((task.tags || []).join(', '));
  const [estimatedMinutes, setEstimatedMinutes] = useState(task.estimatedMinutes || null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdate(task.id, {
        title: title.trim(),
        description: description.trim() || null,
        priority: priority as any,
        dueDate: dueDate || null,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        estimatedMinutes: estimatedMinutes
      });
      
      // Show success notification
      window.api.notification.show({
        type: 'success',
        title: 'Task Updated',
        message: `"${title.trim()}" has been updated successfully.`,
        duration: 3000
      });
      
      onClose();
    } catch (error) {
      console.error('Failed to update task:', error);
      
      // Show error notification
      window.api.notification.show({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update task. Please try again.',
        duration: 3000
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(task.id);
      
      // Show success notification
      window.api.notification.show({
        type: 'success',
        title: 'Task Deleted',
        message: `"${task.title}" has been deleted.`,
        duration: 3000
      });
      
      setShowDeleteConfirm(false);
      onClose();
    } catch (error) {
      console.error('Failed to delete task:', error);
      
      // Show error notification
      window.api.notification.show({
        type: 'error',
        title: 'Delete Failed',
        message: 'Failed to delete task. Please try again.',
        duration: 3000
      });
      
      setIsDeleting(false);
    }
  };

  return (
    <>
      {/* Backdrop - Click to close */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.3)',
          zIndex: 9999,
        }}
      />
      
      {/* Drawer Panel */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '500px',
          background: 'var(--bg-primary)',
          borderLeft: '2px solid var(--card-border)',
          boxShadow: '-4px 0 24px rgba(0,0,0,0.3)',
          zIndex: 10000,
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideInRight 0.3s ease-out'
        }}
      >
      {/* Header */}
      <div
        style={{
          padding: '1.5rem',
          borderBottom: '2px solid var(--card-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          userSelect: 'none',
          WebkitUserSelect: 'none'
        }}
      >
        <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-primary)' }}>Edit Task</h2>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            color: 'var(--text-secondary)',
            padding: '0.25rem',
            lineHeight: 1
          }}
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Title */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '8px',
              border: '2px solid var(--card-border)',
              background: 'var(--card-bg)',
              color: 'var(--text-primary)',
              fontSize: '1rem',
              fontFamily: 'inherit'
            }}
          />
        </div>

        {/* Description (Markdown Editor) */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Description <span style={{ opacity: 0.6, fontWeight: 400 }}>(Markdown supported)</span>
          </label>
          <div data-color-mode={document.body.style.background === '#f5f5f5' ? 'light' : 'dark'}>
            <MDEditor
              value={description}
              onChange={(val) => setDescription(val || '')}
              preview="edit"
              height={250}
              style={{
                borderRadius: '8px',
                border: '2px solid var(--card-border)',
                background: 'var(--card-bg)',
              }}
            />
          </div>
        </div>

        {/* Priority */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Priority (Eisenhower Matrix)
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            {[
              { value: 'Urgent & Important', label: 'Critical', sublabel: 'Do First', color: '#FF5252' },
              { value: 'Urgent & Not Important', label: 'Delegate', sublabel: 'Can Wait', color: '#FF9800' },
              { value: 'Not Urgent & Important', label: 'Schedule', sublabel: 'Plan It', color: '#03DAC6' },
              { value: 'Not Urgent & Not Important', label: 'Low', sublabel: 'Maybe Later', color: '#9E9E9E' },
            ].map((p) => (
              <button
                key={p.value}
                onClick={() => setPriority(p.value)}
                style={{
                  padding: '0.75rem 0.5rem',
                  borderRadius: '6px',
                  border: `2px solid ${priority === p.value ? p.color : 'var(--card-border)'}`,
                  background: priority === p.value ? `${p.color}20` : 'var(--card-bg)',
                  color: priority === p.value ? p.color : 'var(--text-secondary)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem'
                }}
              >
                <div style={{ fontSize: '0.875rem', fontWeight: 700 }}>{p.label}</div>
                <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>{p.sublabel}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Due Date */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Due Date
          </label>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              style={{
                flex: 1,
                minWidth: '200px',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '2px solid var(--card-border)',
                background: 'var(--card-bg)',
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
                fontFamily: 'inherit'
              }}
            />
            {/* Quick date buttons */}
            <div style={{ display: 'flex', gap: '0.375rem' }}>
              <button
                type="button"
                onClick={() => {
                  const today = new Date();
                  setDueDate(today.toISOString().split('T')[0]);
                }}
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: '6px',
                  border: '1px solid var(--card-border)',
                  background: 'var(--card-bg)',
                  color: 'var(--text-secondary)',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => {
                  const tomorrow = new Date();
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  setDueDate(tomorrow.toISOString().split('T')[0]);
                }}
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: '6px',
                  border: '1px solid var(--card-border)',
                  background: 'var(--card-bg)',
                  color: 'var(--text-secondary)',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Tomorrow
              </button>
              <button
                type="button"
                onClick={() => {
                  const nextWeek = new Date();
                  nextWeek.setDate(nextWeek.getDate() + 7);
                  setDueDate(nextWeek.toISOString().split('T')[0]);
                }}
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: '6px',
                  border: '1px solid var(--card-border)',
                  background: 'var(--card-bg)',
                  color: 'var(--text-secondary)',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Next Week
              </button>
            </div>
          </div>
        </div>

        {/* Time Estimation */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Time Estimation
          </label>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <input
              type="number"
              value={estimatedMinutes || ''}
              onChange={(e) => setEstimatedMinutes(e.target.value ? parseInt(e.target.value) : null)}
              placeholder="Minutes"
              min="0"
              style={{
                flex: 1,
                padding: '0.75rem',
                borderRadius: '8px',
                border: '2px solid var(--card-border)',
                background: 'var(--card-bg)',
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
                fontFamily: 'inherit'
              }}
            />
            {estimatedMinutes && (
              <div style={{
                padding: '0.75rem',
                borderRadius: '8px',
                background: 'rgba(3, 218, 198, 0.1)',
                color: '#03DAC6',
                fontSize: '0.875rem',
                fontWeight: 600,
                whiteSpace: 'nowrap'
              }}>
                {estimatedMinutes < 60 
                  ? `${estimatedMinutes}min`
                  : `${Math.floor(estimatedMinutes / 60)}h ${estimatedMinutes % 60}min`
                }
              </div>
            )}
          </div>
          
          {/* Quick time buttons */}
          <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
            {[
              { label: '5min', minutes: 5 },
              { label: '15min', minutes: 15 },
              { label: '30min', minutes: 30 },
              { label: '1h', minutes: 60 },
              { label: '2h', minutes: 120 },
              { label: 'Half day', minutes: 240 },
              { label: 'Full day', minutes: 480 },
            ].map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => setEstimatedMinutes(preset.minutes)}
                style={{
                  padding: '0.375rem 0.75rem',
                  borderRadius: '6px',
                  border: `2px solid ${estimatedMinutes === preset.minutes ? '#03DAC6' : 'var(--card-border)'}`,
                  background: estimatedMinutes === preset.minutes ? 'rgba(3, 218, 198, 0.15)' : 'var(--card-bg)',
                  color: estimatedMinutes === preset.minutes ? '#03DAC6' : 'var(--text-secondary)',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'all 0.2s ease'
                }}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Tags <span style={{ opacity: 0.6, fontWeight: 400 }}>(comma separated)</span>
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="frontend, urgent, bug-fix"
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '8px',
              border: '2px solid var(--card-border)',
              background: 'var(--card-bg)',
              color: 'var(--text-primary)',
              fontSize: '0.875rem',
              fontFamily: 'inherit'
            }}
          />
        </div>
      </div>

      {/* Footer Actions */}
      <div
        style={{
          padding: '1.5rem',
          borderTop: '2px solid var(--card-border)',
          display: 'flex',
          gap: '1rem',
          userSelect: 'none',
          WebkitUserSelect: 'none'
        }}
      >
        <button
          onClick={() => setShowDeleteConfirm(true)}
          disabled={isDeleting}
          style={{
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            border: '2px solid #FF5252',
            background: 'transparent',
            color: '#FF5252',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: isDeleting ? 'not-allowed' : 'pointer',
            opacity: isDeleting ? 0.5 : 1,
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => !isDeleting && (e.currentTarget.style.background = '#FF525220')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          {isDeleting ? 'Deleting...' : 'Delete Task'}
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving || !title.trim()}
          style={{
            flex: 1,
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            border: 'none',
            background: isSaving || !title.trim() ? 'var(--card-border)' : '#03DAC6',
            color: '#000',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: isSaving || !title.trim() ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Task"
        message={`Are you sure you want to delete "${task.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
    </>
  );
}

function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'Urgent & Important':
    case 'Urgent and Important':
      return '#FF5252';
    case 'Urgent & Not Important':
    case 'Urgent and Not Important':
      return '#FF9800';
    case 'Not Urgent & Important':
    case 'Not Urgent but Important':
      return '#03DAC6';
    case 'Not Urgent & Not Important':
    case 'Not Urgent and Not Important':
      return '#9E9E9E';
    default:
      return '#03DAC6';
  }
}

export default TaskDetailPanel;
