import { useEffect, useState } from 'react';
import { useHabits } from '../../store/habits';
import './HabitsPage.css';

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
    logHabit,
    unlogHabit,
  } = useHabits();

  const [showCreateModal, setShowCreateModal] = useState(false);
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

  if (loading) {
    return (
      <div className="habits-page">
        <div className="loading">Loading habits...</div>
      </div>
    );
  }

  return (
    <div className="habits-page">
      <div className="habits-header">
        <h1>Habits</h1>
        <button onClick={() => setShowCreateModal(true)} className="btn-primary">
          + New Habit
        </button>
      </div>

      <div className="habits-stats">
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
        <div className="category-filter">
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

      <div className="habits-grid">
        {filteredHabits.length === 0 ? (
          <div className="empty-state">
            <p>No habits yet. Create your first habit to get started!</p>
          </div>
        ) : (
          filteredHabits.map(habit => (
            <div
              key={habit.id}
              className={`habit-card ${habit.todayCompleted ? 'completed' : ''}`}
              style={{ borderColor: habit.color || '#3b82f6' }}
            >
              <div className="habit-card-header">
                <div className="habit-icon">{habit.icon || '⭐'}</div>
                <div className="habit-info">
                  <h3>{habit.name}</h3>
                  {habit.description && <p className="habit-description">{habit.description}</p>}
                  {habit.category && <span className="habit-category">{habit.category}</span>}
                </div>
                <button
                  className={`habit-check ${habit.todayCompleted ? 'checked' : ''}`}
                  onClick={() => handleToggleHabit(habit.id, habit.todayCompleted)}
                >
                  {habit.todayCompleted ? '✓' : ''}
                </button>
              </div>

              <div className="habit-card-stats">
                <div className="stat">
                  <div className="stat-icon">🔥</div>
                  <div>
                    <div className="stat-value-sm">{habit.currentStreak}</div>
                    <div className="stat-label-sm">Current Streak</div>
                  </div>
                </div>
                <div className="stat">
                  <div className="stat-icon">🏆</div>
                  <div>
                    <div className="stat-value-sm">{habit.longestStreak}</div>
                    <div className="stat-label-sm">Best Streak</div>
                  </div>
                </div>
                <div className="stat">
                  <div className="stat-icon">📊</div>
                  <div>
                    <div className="stat-value-sm">{habit.completionRate}%</div>
                    <div className="stat-label-sm">30d Rate</div>
                  </div>
                </div>
              </div>

              <div className="habit-card-footer">
                <span className="habit-frequency">
                  {habit.frequency.charAt(0).toUpperCase() + habit.frequency.slice(1)}
                  {habit.targetCount > 1 && ` • ${habit.targetCount}x`}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {showCreateModal && (
        <CreateHabitModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateHabit}
        />
      )}
    </div>
  );
}
