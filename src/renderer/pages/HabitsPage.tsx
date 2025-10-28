import { useEffect, useState } from 'react';
import { useHabits } from '../../store/habits';
import { ConfirmDialog } from '../components/ConfirmDialog';
import type { HabitWithStats } from '../../database/habitsRepo';
import './HabitsPage.css';

interface EditHabitModalProps {
  habit: HabitWithStats;
  onClose: () => void;
  onUpdate: (id: number, input: {
    name: string;
    description?: string;
    icon?: string;
    color?: string;
    category?: string;
    frequency?: 'daily' | 'weekly' | 'monthly';
    targetCount?: number;
  }) => void;
}

function EditHabitModal({ habit, onClose, onUpdate }: EditHabitModalProps) {
  const [name, setName] = useState(habit.name);
  const [description, setDescription] = useState(habit.description || '');
  const [icon, setIcon] = useState(habit.icon || '⭐');
  const [color, setColor] = useState(habit.color || '#3b82f6');
  const [category, setCategory] = useState(habit.category || '');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>(habit.frequency);
  const [targetCount, setTargetCount] = useState(habit.targetCount);

  const handleSubmit = () => {
    if (!name.trim()) return;
    onUpdate(habit.id, {
      name: name.trim(),
      description: description.trim() || undefined,
      icon,
      color,
      category: category.trim() || undefined,
      frequency,
      targetCount,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Edit Habit</h2>
        
        <div className="form-group">
          <label>Icon</label>
          <input
            type="text"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            placeholder="⭐"
            maxLength={2}
          />
        </div>

        <div className="form-group">
          <label>Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Exercise, Read, Meditate..."
            autoFocus
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Why is this habit important?"
            rows={3}
          />
        </div>

        <div className="form-group">
          <label>Category</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Health, Learning, Productivity..."
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Frequency</label>
            <select value={frequency} onChange={(e) => setFrequency(e.target.value as any)}>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div className="form-group">
            <label>Target</label>
            <input
              type="number"
              value={targetCount}
              onChange={(e) => setTargetCount(parseInt(e.target.value) || 1)}
              min={1}
            />
          </div>

          <div className="form-group">
            <label>Color</label>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />
          </div>
        </div>

        <div className="modal-actions">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button onClick={handleSubmit} className="btn-primary" disabled={!name.trim()}>
            Update Habit
          </button>
        </div>
      </div>
    </div>
  );
}

interface CreateHabitModalProps {
  onClose: () => void;
  onCreate: (input: {
    name: string;
    description?: string;
    icon?: string;
    color?: string;
    category?: string;
    frequency?: 'daily' | 'weekly' | 'monthly';
    targetCount?: number;
  }) => void;
}

function CreateHabitModal({ onClose, onCreate }: CreateHabitModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('⭐');
  const [color, setColor] = useState('#3b82f6');
  const [category, setCategory] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [targetCount, setTargetCount] = useState(1);

  const handleSubmit = () => {
    if (!name.trim()) return;
    onCreate({
      name: name.trim(),
      description: description.trim() || undefined,
      icon,
      color,
      category: category.trim() || undefined,
      frequency,
      targetCount,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Create New Habit</h2>
        
        <div className="form-group">
          <label>Icon</label>
          <input
            type="text"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            placeholder="⭐"
            maxLength={2}
          />
        </div>

        <div className="form-group">
          <label>Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Exercise, Read, Meditate..."
            autoFocus
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Why is this habit important?"
            rows={3}
          />
        </div>

        <div className="form-group">
          <label>Category</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Health, Learning, Productivity..."
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Frequency</label>
            <select value={frequency} onChange={(e) => setFrequency(e.target.value as any)}>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div className="form-group">
            <label>Target</label>
            <input
              type="number"
              value={targetCount}
              onChange={(e) => setTargetCount(parseInt(e.target.value) || 1)}
              min={1}
            />
          </div>

          <div className="form-group">
            <label>Color</label>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />
          </div>
        </div>

        <div className="modal-actions">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button onClick={handleSubmit} className="btn-primary" disabled={!name.trim()}>
            Create Habit
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HabitsPage() {
  const {
    habits,
    loading,
    loadHabits,
    createHabit,
    updateHabit,
    deleteHabit,
    logHabit,
    unlogHabit,
  } = useHabits();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState<HabitWithStats | null>(null);
  const [habitToDelete, setHabitToDelete] = useState<HabitWithStats | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadHabits();
  }, []);

  const categories = ['all', ...new Set(habits.filter(h => h.category).map(h => h.category!))];
  
  const filteredHabits = selectedCategory === 'all'
    ? habits
    : habits.filter(h => h.category === selectedCategory);

  const today = new Date().toISOString().split('T')[0];

  const handleToggleHabit = async (habitId: number, completed: boolean) => {
    if (completed) {
      await unlogHabit(habitId, today);
    } else {
      await logHabit(habitId, today, 1);
    }
  };

  const handleCreateHabit = async (input: Parameters<typeof createHabit>[0]) => {
    await createHabit(input);
    await window.api.notification.show({
      type: 'success',
      title: 'Habit Created',
      message: `"${input.name}" has been added to your habits.`,
      duration: 3000,
    });
  };

  const handleUpdateHabit = async (id: number, input: Parameters<typeof createHabit>[0]) => {
    await updateHabit(id, input);
    await window.api.notification.show({
      type: 'success',
      title: 'Habit Updated',
      message: `"${input.name}" has been updated.`,
      duration: 3000,
    });
  };

  const handleDeleteHabit = async () => {
    if (!habitToDelete) return;
    await deleteHabit(habitToDelete.id);
    await window.api.notification.show({
      type: 'success',
      title: 'Habit Deleted',
      message: `"${habitToDelete.name}" has been removed.`,
      duration: 3000,
    });
    setHabitToDelete(null);
  };

  if (loading) {
    return (
      <div className="habits-page">
        <div className="loading">Loading habits...</div>
      </div>
    );
  }

  return (
    <div className="habits-page" style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      <div className="habits-header">
        <h1>Habits</h1>
        <button onClick={() => setShowCreateModal(true)} className="btn-primary">
          + New Habit
        </button>
      </div>

      <div className="habits-stats" style={{ flexShrink: 0 }}>
        <div className="stat-card">
          <div className="stat-value">{habits.length}</div>
          <div className="stat-label">Total Habits</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{habits.filter(h => h.todayCompleted).length}</div>
          <div className="stat-label">Completed Today</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {habits.length > 0 
              ? Math.round(habits.reduce((sum, h) => sum + h.completionRate, 0) / habits.length)
              : 0}%
          </div>
          <div className="stat-label">Avg Completion Rate</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {Math.max(...habits.map(h => h.currentStreak), 0)}
          </div>
          <div className="stat-label">Best Current Streak</div>
        </div>
      </div>

      {categories.length > 1 && (
        <div className="category-filter" style={{ flexShrink: 0 }}>
          {categories.map(cat => (
            <button
              key={cat}
              className={`category-btn ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat === 'all' ? 'All' : cat}
            </button>
          ))}
        </div>
      )}

      <div style={{
        flex: 1,
        minHeight: 0,
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: '0.5rem'
      }}>
        {filteredHabits.length === 0 ? (
          <div className="empty-state">
            <p>No habits yet. Create your first habit to get started!</p>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}>
            {filteredHabits.map(habit => (
              <div
                key={habit.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem 1.5rem',
                  borderRadius: '12px',
                  background: habit.todayCompleted 
                    ? 'rgba(3, 218, 198, 0.1)' 
                    : 'var(--card-bg)',
                  border: `2px solid ${habit.todayCompleted ? 'rgba(3, 218, 198, 0.3)' : 'var(--card-border)'}`,
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  if (!habit.todayCompleted) {
                    e.currentTarget.style.background = 'var(--hover-bg)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!habit.todayCompleted) {
                    e.currentTarget.style.background = 'var(--card-bg)';
                  }
                }}
              >
                {/* Icon */}
                <div style={{
                  fontSize: '2rem',
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: `${habit.color || '#3b82f6'}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {habit.icon || '⭐'}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{habit.name}</h3>
                    {habit.category && (
                      <span style={{
                        fontSize: '0.75rem',
                        padding: '0.125rem 0.5rem',
                        borderRadius: '6px',
                        background: 'rgba(98, 0, 238, 0.2)',
                        color: '#9333ea'
                      }}>
                        {habit.category}
                      </span>
                    )}
                  </div>
                  {habit.description && (
                    <p style={{
                      margin: 0,
                      fontSize: '0.875rem',
                      color: 'var(--text-secondary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {habit.description}
                    </p>
                  )}
                </div>

                {/* Stats */}
                <div style={{
                  display: 'flex',
                  gap: '1.5rem',
                  alignItems: 'center',
                  flexShrink: 0
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FF9800' }}>
                      {habit.currentStreak}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>🔥 Streak</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#9333ea' }}>
                      {habit.longestStreak}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>🏆 Best</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#03DAC6' }}>
                      {habit.completionRate}%
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>📊 Rate</div>
                  </div>
                </div>

                {/* Frequency Badge */}
                <div style={{
                  fontSize: '0.75rem',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '6px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'var(--text-secondary)',
                  flexShrink: 0
                }}>
                  {habit.frequency.charAt(0).toUpperCase() + habit.frequency.slice(1)}
                  {habit.targetCount > 1 && ` • ${habit.targetCount}x`}
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                  {/* Edit Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingHabit(habit);
                    }}
                    style={{
                      padding: '0.5rem',
                      borderRadius: '8px',
                      border: 'none',
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(3, 218, 198, 0.2)';
                      e.currentTarget.style.color = '#03DAC6';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }}
                    title="Edit habit"
                  >
                    ✏️
                  </button>
                  
                  {/* Delete Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setHabitToDelete(habit);
                    }}
                    style={{
                      padding: '0.5rem',
                      borderRadius: '8px',
                      border: 'none',
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 82, 82, 0.2)';
                      e.currentTarget.style.color = '#FF5252';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }}
                    title="Delete habit"
                  >
                    🗑️
                  </button>
                  
                  {/* Completion Checkbox */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleHabit(habit.id, habit.todayCompleted);
                    }}
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      border: 'none',
                      background: habit.todayCompleted 
                        ? 'linear-gradient(135deg, #03DAC6 0%, #00E676 100%)'
                        : 'rgba(255, 255, 255, 0.1)',
                      color: habit.todayCompleted ? '#000' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontSize: '1.5rem',
                      fontWeight: 700,
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: habit.todayCompleted ? '0 4px 12px rgba(3, 218, 198, 0.3)' : 'none'
                    }}
                    onMouseEnter={(e) => {
                      if (!habit.todayCompleted) {
                        e.currentTarget.style.background = 'rgba(3, 218, 198, 0.2)';
                        e.currentTarget.style.color = '#03DAC6';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!habit.todayCompleted) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                        e.currentTarget.style.color = 'var(--text-secondary)';
                      }
                    }}
                  >
                    {habit.todayCompleted ? '✓' : ''}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateHabitModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateHabit}
        />
      )}

      {editingHabit && (
        <EditHabitModal
          habit={editingHabit}
          onClose={() => setEditingHabit(null)}
          onUpdate={handleUpdateHabit}
        />
      )}

      <ConfirmDialog
        isOpen={!!habitToDelete}
        title="Delete Habit"
        message={`Are you sure you want to delete "${habitToDelete?.name}"? This will permanently remove all logs and statistics for this habit.`}
        confirmText="Delete Habit"
        cancelText="Cancel"
        type="danger"
        onConfirm={handleDeleteHabit}
        onCancel={() => setHabitToDelete(null)}
      />
    </div>
  );
}
