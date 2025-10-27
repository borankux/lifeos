import { useEffect, useState } from 'react';
import MDEditor from '@uiw/react-md-editor';
import ReactMarkdown from 'react-markdown';

interface Notebook {
  id: number;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  noteCount: number;
}

interface Note {
  id: number;
  notebookId: number;
  title: string;
  content: string;
  wordCount: number;
  tags: string[] | null;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function NotebookPage() {
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [selectedNotebook, setSelectedNotebook] = useState<Notebook | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showNotebookModal, setShowNotebookModal] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const [newNotebookName, setNewNotebookName] = useState('');
  const [newNotebookIcon, setNewNotebookIcon] = useState('📓');
  const [newNotebookDesc, setNewNotebookDesc] = useState('');
  
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    loadNotebooks();
  }, []);

  useEffect(() => {
    if (selectedNotebook) {
      loadNotes(selectedNotebook.id);
    }
  }, [selectedNotebook]);

  async function loadNotebooks() {
    try {
      const response = await window.api.notebook.listNotebooks();
      if (response.ok && response.data) {
        setNotebooks(response.data);
        if (response.data.length > 0 && !selectedNotebook) {
          setSelectedNotebook(response.data[0]);
        }
      }
    } catch (error) {
      console.error('Failed to load notebooks:', error);
    }
  }

  async function loadNotes(notebookId: number) {
    try {
      const response = await window.api.notebook.listNotes({ notebookId });
      if (response.ok && response.data) {
        setNotes(response.data);
      }
    } catch (error) {
      console.error('Failed to load notes:', error);
    }
  }

  async function handleCreateNotebook() {
    if (!newNotebookName.trim()) return;
    
    try {
      const response = await window.api.notebook.createNotebook({
        name: newNotebookName.trim(),
        description: newNotebookDesc.trim() || undefined,
        icon: newNotebookIcon
      });
      
      if (response.ok) {
        setNewNotebookName('');
        setNewNotebookDesc('');
        setNewNotebookIcon('📓');
        setShowNotebookModal(false);
        await loadNotebooks();
        
        window.api.notification.show({
          type: 'success',
          title: 'Notebook Created',
          message: `"${newNotebookName}" created successfully.`,
          duration: 3000
        });
      }
    } catch (error) {
      console.error('Failed to create notebook:', error);
    }
  }

  async function handleCreateNote() {
    if (!selectedNotebook) return;
    
    const title = `New Note ${new Date().toLocaleString()}`;
    
    try {
      const response = await window.api.notebook.createNote({
        notebookId: selectedNotebook.id,
        title,
        content: ''
      });
      
      if (response.ok && response.data) {
        await loadNotes(selectedNotebook.id);
        setSelectedNote(response.data);
        setIsEditing(true);
        setEditTitle(response.data.title);
        setEditContent(response.data.content);
      }
    } catch (error) {
      console.error('Failed to create note:', error);
    }
  }

  async function handleSaveNote() {
    if (!selectedNote) return;
    
    setSaveStatus('saving');
    try {
      const response = await window.api.notebook.updateNote({
        id: selectedNote.id,
        payload: {
          title: editTitle,
          content: editContent
        }
      });
      
      if (response.ok) {
        setSaveStatus('saved');
        setIsEditing(false);
        await loadNotes(selectedNotebook!.id);
        setSelectedNote(response.data);
        
        window.api.notification.show({
          type: 'success',
          title: 'Note Saved',
          message: 'Your note has been saved.',
          duration: 2000
        });
        
        // Reset status after 2 seconds
        setTimeout(() => setSaveStatus('idle'), 2000);
      }
    } catch (error) {
      console.error('Failed to save note:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  }

  async function handleDeleteNote() {
    if (!selectedNote) return;
    
    try {
      const response = await window.api.notebook.deleteNote({ id: selectedNote.id });
      
      if (response.ok) {
        setSelectedNote(null);
        setIsEditing(false);
        await loadNotes(selectedNotebook!.id);
        
        window.api.notification.show({
          type: 'success',
          title: 'Note Deleted',
          message: 'Note has been deleted.',
          duration: 2000
        });
      }
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  }

  function handleSelectNote(note: Note) {
    setSelectedNote(note);
    setIsEditing(false);
    setEditTitle(note.title);
    setEditContent(note.content);
  }

  function handleEditNote() {
    if (!selectedNote) return;
    setIsEditing(true);
    setSaveStatus('idle');
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S or Cmd+S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's' && isEditing) {
        e.preventDefault();
        handleSaveNote();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditing, editTitle, editContent, selectedNote]);

  // Track content changes
  useEffect(() => {
    if (isEditing && selectedNote && (editTitle !== selectedNote.title || editContent !== selectedNote.content)) {
      if (saveStatus !== 'saving') {
        setSaveStatus('idle');
      }
    }
  }, [editTitle, editContent, isEditing, selectedNote]);

  return (
    <div style={{ height: '100%', overflow: 'hidden', padding: isFullscreen ? 0 : '1rem' }}>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: isFullscreen ? '1fr' : '280px 350px 1fr', 
        gap: isFullscreen ? 0 : '1rem', 
        height: '100%' 
      }}>
        {/* Notebooks Sidebar - Hidden in fullscreen */}
        {!isFullscreen && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>
              📚 Notebooks
            </h2>
            <button
              onClick={() => setShowNotebookModal(true)}
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: '8px',
                border: 'none',
                background: '#03DAC6',
                color: '#121212',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem'
              }}
            >
              ➕ New
            </button>
          </div>

          <div style={{ flex: 1, overflow: 'auto' }}>
            {notebooks.map((notebook) => (
              <div
                key={notebook.id}
                onClick={() => setSelectedNotebook(notebook)}
                style={{
                  padding: '0.875rem',
                  marginBottom: '0.5rem',
                  borderRadius: '10px',
                  background: selectedNotebook?.id === notebook.id ? 'rgba(3, 218, 198, 0.15)' : 'var(--card-bg)',
                  border: `2px solid ${selectedNotebook?.id === notebook.id ? '#03DAC6' : 'var(--card-border)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                  <span style={{ fontSize: '1.25rem' }}>{notebook.icon || '📓'}</span>
                  <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                    {notebook.name}
                  </span>
                </div>
                {notebook.description && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.375rem', lineHeight: 1.4 }}>
                    {notebook.description}
                  </div>
                )}
                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                  {notebook.noteCount} {notebook.noteCount === 1 ? 'note' : 'notes'}
                </div>
              </div>
            ))}
          </div>
        </div>
        )}

        {/* Notes List - Hidden in fullscreen */}
        {!isFullscreen && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>
              📝 Notes
            </h2>
            
            {selectedNotebook && (
              <button
                onClick={handleCreateNote}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#6200EE',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem'
                }}
              >
                ➕ New Note
              </button>
            )}
          </div>

          <div style={{ flex: 1, overflow: 'auto' }}>
            {notes.map((note) => (
              <div
                key={note.id}
                onClick={() => handleSelectNote(note)}
                style={{
                  padding: '0.875rem',
                  marginBottom: '0.5rem',
                  borderRadius: '10px',
                  background: selectedNote?.id === note.id ? 'rgba(98, 0, 238, 0.15)' : 'var(--card-bg)',
                  border: `2px solid ${selectedNote?.id === note.id ? '#6200EE' : 'var(--card-border)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  {note.title}
                </div>
                
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.5rem', maxHeight: '3rem', overflow: 'hidden' }}>
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <span>{children}</span>,
                      strong: ({ children }) => <strong>{children}</strong>,
                      em: ({ children }) => <em>{children}</em>,
                      code: ({ children }) => <code style={{ 
                        background: 'rgba(255, 255, 255, 0.05)', 
                        padding: '0.125rem 0.25rem', 
                        borderRadius: '3px' 
                      }}>{children}</code>,
                      h1: ({ children }) => <strong>{children}</strong>,
                      h2: ({ children }) => <strong>{children}</strong>,
                      h3: ({ children }) => <strong>{children}</strong>,
                      ul: ({ children }) => <span>{children}</span>,
                      ol: ({ children }) => <span>{children}</span>,
                      li: ({ children }) => <span>• {children} </span>,
                    }}
                  >
                    {note.content.substring(0, 150)}
                  </ReactMarkdown>
                  {note.content.length > 150 && '...'}
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                  <span>📊 {note.wordCount} words</span>
                  <span>🕒 {new Date(note.createdAt).toLocaleDateString()}</span>
                  {note.isPinned && <span style={{ color: '#FF9800' }}>📌</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
        )}

        {/* Note Editor/Viewer */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '1rem', 
          overflow: 'hidden', 
          padding: isFullscreen ? '2rem' : '1.5rem', 
          background: 'var(--card-bg)', 
          borderRadius: isFullscreen ? 0 : '12px', 
          border: isFullscreen ? 'none' : '2px solid var(--card-border)',
          height: isFullscreen ? '100vh' : 'auto'
        }}>
          {selectedNote ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ flex: 1, marginRight: '1rem' }}>
                  {isEditing ? (
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        border: '2px solid var(--card-border)',
                        borderRadius: '8px',
                        background: 'var(--hover-bg)',
                        color: 'var(--text-primary)'
                      }}
                    />
                  ) : (
                    <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>
                      {selectedNote.title}
                    </h1>
                  )}
                </div>
                
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  {/* Save Status Indicator */}
                  {isEditing && (
                    <div style={{
                      padding: '0.5rem 0.75rem',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                      ...(saveStatus === 'saving' && {
                        background: 'rgba(255, 152, 0, 0.15)',
                        color: '#FF9800'
                      }),
                      ...(saveStatus === 'saved' && {
                        background: 'rgba(3, 218, 198, 0.15)',
                        color: '#03DAC6'
                      }),
                      ...(saveStatus === 'error' && {
                        background: 'rgba(255, 82, 82, 0.15)',
                        color: '#FF5252'
                      }),
                      ...(saveStatus === 'idle' && {
                        background: 'rgba(158, 158, 158, 0.15)',
                        color: '#9E9E9E'
                      })
                    }}>
                      {saveStatus === 'saving' && '⏳ Saving...'}
                      {saveStatus === 'saved' && '✓ Saved'}
                      {saveStatus === 'error' && '⚠ Error'}
                      {saveStatus === 'idle' && '✏️ Unsaved'}
                    </div>
                  )}
                  
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleSaveNote}
                        disabled={saveStatus === 'saving'}
                        style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '6px',
                          border: 'none',
                          background: saveStatus === 'saving' ? 'rgba(3, 218, 198, 0.5)' : '#03DAC6',
                          color: '#121212',
                          cursor: saveStatus === 'saving' ? 'not-allowed' : 'pointer',
                          fontWeight: 600,
                          fontSize: '0.875rem'
                        }}
                      >
                        💾 {saveStatus === 'saving' ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setSaveStatus('idle');
                        }}
                        style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '6px',
                          border: '1px solid var(--card-border)',
                          background: 'transparent',
                          color: 'var(--text-secondary)',
                          cursor: 'pointer',
                          fontSize: '0.875rem'
                        }}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      {/* Fullscreen toggle button */}
                      <button
                        onClick={toggleFullscreen}
                        style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '6px',
                          border: '1px solid var(--card-border)',
                          background: isFullscreen ? 'rgba(98, 0, 238, 0.15)' : 'transparent',
                          color: isFullscreen ? '#6200EE' : 'var(--text-secondary)',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          fontWeight: 600
                        }}
                      >
                        {isFullscreen ? '🗗 Exit Fullscreen' : '🗖 Fullscreen'}
                      </button>
                      <button
                        onClick={handleEditNote}
                        style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '6px',
                          border: 'none',
                          background: '#6200EE',
                          color: '#fff',
                          cursor: 'pointer',
                          fontWeight: 600,
                          fontSize: '0.875rem'
                        }}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={handleDeleteNote}
                        style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '6px',
                          border: 'none',
                          background: 'rgba(255, 82, 82, 0.2)',
                          color: '#FF5252',
                          cursor: 'pointer',
                          fontSize: '0.875rem'
                        }}
                      >
                        🗑️
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', display: 'flex', gap: '1rem' }}>
                <span>📊 {selectedNote.wordCount} words</span>
                <span>📅 Created: {new Date(selectedNote.createdAt).toLocaleString()}</span>
                <span>🔄 Updated: {new Date(selectedNote.updatedAt).toLocaleString()}</span>
              </div>

              <div style={{ flex: 1, overflow: 'auto' }}>
                {isEditing ? (
                  <div data-color-mode={document.body.style.background === '#f5f5f5' ? 'light' : 'dark'}>
                    <MDEditor
                      value={editContent}
                      onChange={(val) => setEditContent(val || '')}
                      preview="live"
                      height="100%"
                      style={{
                        borderRadius: '8px',
                        border: '2px solid var(--card-border)'
                      }}
                    />
                  </div>
                ) : (
                  <div style={{ fontSize: '1rem', lineHeight: 1.8 }}>
                    <ReactMarkdown>{selectedNote.content}</ReactMarkdown>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
              <div>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📝</div>
                <div style={{ fontSize: '1.25rem', color: 'var(--text-secondary)' }}>
                  Select a note to view or edit
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', marginTop: '0.5rem' }}>
                  or create a new one
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Notebook Modal */}
      {showNotebookModal && (
        <div
          onClick={() => setShowNotebookModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--card-bg)',
              borderRadius: '16px',
              border: '2px solid var(--card-border)',
              padding: '1.5rem',
              width: '90%',
              maxWidth: '400px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
            }}
          >
            <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem', fontWeight: 700 }}>
              🆕 Create New Notebook
            </h3>
            
            <input
              placeholder="Notebook name..."
              value={newNotebookName}
              onChange={(e) => setNewNotebookName(e.target.value)}
              autoFocus
              style={{
                width: '100%',
                padding: '0.75rem',
                marginBottom: '1rem',
                borderRadius: '8px',
                border: '2px solid var(--card-border)',
                background: 'var(--hover-bg)',
                color: 'var(--text-primary)',
                fontSize: '1rem'
              }}
            />
            
            <input
              placeholder="Icon (emoji)"
              value={newNotebookIcon}
              onChange={(e) => setNewNotebookIcon(e.target.value)}
              maxLength={2}
              style={{
                width: '100%',
                padding: '0.75rem',
                marginBottom: '1rem',
                borderRadius: '8px',
                border: '2px solid var(--card-border)',
                background: 'var(--hover-bg)',
                color: 'var(--text-primary)',
                fontSize: '1rem',
                textAlign: 'center'
              }}
            />
            
            <textarea
              placeholder="Description (optional)..."
              value={newNotebookDesc}
              onChange={(e) => setNewNotebookDesc(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                marginBottom: '1.5rem',
                borderRadius: '8px',
                border: '2px solid var(--card-border)',
                background: 'var(--hover-bg)',
                color: 'var(--text-primary)',
                fontSize: '1rem',
                minHeight: '80px',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
            />
            
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setShowNotebookModal(false)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '2px solid var(--card-border)',
                  background: 'transparent',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '1rem'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNotebook}
                disabled={!newNotebookName.trim()}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: newNotebookName.trim() ? '#03DAC6' : 'rgba(255,255,255,0.1)',
                  color: newNotebookName.trim() ? '#121212' : 'var(--text-secondary)',
                  cursor: newNotebookName.trim() ? 'pointer' : 'not-allowed',
                  fontWeight: 600,
                  fontSize: '1rem'
                }}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
