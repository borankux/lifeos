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
    
    try {
      const response = await window.api.notebook.updateNote({
        id: selectedNote.id,
        payload: {
          title: editTitle,
          content: editContent
        }
      });
      
      if (response.ok) {
        setIsEditing(false);
        await loadNotes(selectedNotebook!.id);
        setSelectedNote(response.data);
        
        window.api.notification.show({
          type: 'success',
          title: 'Note Saved',
          message: 'Your note has been saved.',
          duration: 2000
        });
      }
    } catch (error) {
      console.error('Failed to save note:', error);
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
  }

  return (
    <div style={{ height: '100%', overflow: 'hidden', padding: '1rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '280px 350px 1fr', gap: '1rem', height: '100%' }}>
        {/* Notebooks Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflow: 'hidden' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>
            📚 Notebooks
          </h2>
          
          <div style={{ padding: '1rem', background: 'var(--card-bg)', borderRadius: '12px', border: '2px solid var(--card-border)' }}>
            <input
              placeholder="Notebook name..."
              value={newNotebookName}
              onChange={(e) => setNewNotebookName(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                marginBottom: '0.5rem',
                borderRadius: '6px',
                border: '1px solid var(--card-border)',
                background: 'var(--hover-bg)',
                color: 'var(--text-primary)',
                fontSize: '0.875rem'
              }}
            />
            
            <input
              placeholder="Icon (emoji)"
              value={newNotebookIcon}
              onChange={(e) => setNewNotebookIcon(e.target.value)}
              maxLength={2}
              style={{
                width: '100%',
                padding: '0.5rem',
                marginBottom: '0.5rem',
                borderRadius: '6px',
                border: '1px solid var(--card-border)',
                background: 'var(--hover-bg)',
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
                textAlign: 'center'
              }}
            />
            
            <textarea
              placeholder="Description..."
              value={newNotebookDesc}
              onChange={(e) => setNewNotebookDesc(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                marginBottom: '0.5rem',
                borderRadius: '6px',
                border: '1px solid var(--card-border)',
                background: 'var(--hover-bg)',
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
                minHeight: '60px',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
            />
            
            <button
              onClick={handleCreateNotebook}
              disabled={!newNotebookName.trim()}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '6px',
                border: 'none',
                background: newNotebookName.trim() ? '#03DAC6' : 'rgba(255,255,255,0.1)',
                color: newNotebookName.trim() ? '#121212' : 'var(--text-secondary)',
                cursor: newNotebookName.trim() ? 'pointer' : 'not-allowed',
                fontWeight: 600,
                fontSize: '0.875rem'
              }}
            >
              Create Notebook
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

        {/* Notes List */}
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
                  {note.content.substring(0, 100)}...
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

        {/* Note Editor/Viewer */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflow: 'hidden', padding: '1.5rem', background: 'var(--card-bg)', borderRadius: '12px', border: '2px solid var(--card-border)' }}>
          {selectedNote ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ flex: 1 }}>
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
                
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleSaveNote}
                        style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '6px',
                          border: 'none',
                          background: '#03DAC6',
                          color: '#121212',
                          cursor: 'pointer',
                          fontWeight: 600,
                          fontSize: '0.875rem'
                        }}
                      >
                        💾 Save
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
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
                      preview="edit"
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
    </div>
  );
}
